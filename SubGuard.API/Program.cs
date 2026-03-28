using FluentValidation;
using FluentValidation.AspNetCore;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using Polly;
using Polly.Extensions.Http;
using SubGuard.Data.Repositories;
using SubGuard.Data.UnitOfWork;
using Serilog;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Repositories;
using SubGuard.Core.Models;
using SubGuard.Core.Services;
using SubGuard.Core.UnitOfWork;
using SubGuard.Service.Mapping;
using SubGuard.Service.Services;
using SubGuard.Service.Validations;
using System.Reflection;
using System.Security.Claims;
using System.Threading.RateLimiting;

// 1. Serilog Kurulumu (Builder'dan ï¿½nce)
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(new ConfigurationBuilder()
        .AddJsonFile("appsettings.json")
        .Build())
    .Enrich.FromLogContext()
    .CreateLogger();

try
{
    Log.Information("Uygulama baï¿½latï¿½lï¿½yor...");

    var builder = WebApplication.CreateBuilder(args);

    // --- POLLY POLICY TANIMLARI ---
    // 1. Retry Policy: Hata alï¿½rsa 3 kez, 2'ï¿½er saniye arayla dene.
    var retryPolicy = HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(2));

    // 2. Circuit Breaker: Ardï¿½ï¿½ï¿½k 5 hatadan sonra 30 saniye sistemi kapat (devreyi kes).
    var circuitBreakerPolicy = HttpPolicyExtensions
        .HandleTransientHttpError()
        .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30));

    // FrankfurterExchangeRateProvider'Ä± HttpClient + Polly politikalarÄ±yla kaydet
    builder.Services.AddHttpClient<IExchangeRateProvider, FrankfurterExchangeRateProvider>(client =>
    {
        client.BaseAddress = new Uri("https://api.frankfurter.app/");
    })
    .AddPolicyHandler(retryPolicy)
    .AddPolicyHandler(circuitBreakerPolicy);

    builder.Services.AddScoped<ICurrencyService, CurrencyService>();

    // 2. Host'a Serilog'u baï¿½la
    builder.Host.UseSerilog();

    // --- MEVCUT SERVï¿½S KAYITLARI (Deï¿½iï¿½iklik Yok) ---
    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.AddValidatorsFromAssemblyContaining<RegisterDtoValidator>();

    builder.Services.AddControllers().ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState.Values
                .Where(v => v.Errors.Count > 0)
                .SelectMany(v => v.Errors)
                .Select(v => v.ErrorMessage)
                .ToList();

            var responseDto = CustomResponseDto<bool>.Fail(400, errors);
            return new BadRequestObjectResult(responseDto);
        };
    });

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    builder.Services.AddDbContext<AppDbContext>(x =>
    {
        x.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), option =>
        {
            option.MigrationsAssembly(Assembly.GetAssembly(typeof(AppDbContext)).GetName().Name);
        });
    });

    builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequiredLength = 8;

        // Account Lockout: 5 hatalÄ± denemede 15 dakika kilitle
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.AllowedForNewUsers = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("JwtSettings");
        var secretKeyRaw = jwtSettings["SecretKey"];
        if (string.IsNullOrWhiteSpace(secretKeyRaw))
            throw new InvalidOperationException("'JwtSettings:SecretKey' yapılandırması eksik. Uygulama başlatılamıyor.");
        byte[] key;
        try
        {
            key = Convert.FromBase64String(secretKeyRaw);
        }
        catch (FormatException)
        {
            throw new InvalidOperationException("'JwtSettings:SecretKey' geçerli bir Base64 string değil. Lütfen 32+ byte'lık random bir değer Base64 formatında ayarlayın.");
        }
        if (key.Length < 32)
            throw new InvalidOperationException($"'JwtSettings:SecretKey' çok kısa ({key.Length} byte). HMACSHA256 için en az 32 byte gereklidir.");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero  // B-17: Default 5dk tolerans kaldÄ±rÄ±ldÄ± â€” 15dk token gerÃ§ekten 15dk geÃ§erli
        };

        // Silinen/iptal edilmiÅŸ kullanÄ±cÄ±larÄ±n token'larÄ±nÄ± reddet
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async ctx =>
            {
                var userId = ctx.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null) return;

                // 1. Katman: In-memory revoke store (hÄ±zlÄ± â€” hesap silme anÄ±nda set edilir)
                var revokedStore = ctx.HttpContext.RequestServices
                    .GetRequiredService<IRevokedUserStore>();
                if (revokedStore.IsRevoked(userId))
                {
                    ctx.Fail("Token geÃ§ersiz kÄ±lÄ±nmÄ±ÅŸ.");
                    return;
                }

                // 2. Katman: DB kontrolÃ¼ â€” API yeniden baÅŸlatÄ±lsa bile silinmiÅŸ kullanÄ±cÄ±yÄ± yakalar.
                // In-memory cache sÄ±fÄ±rlansa dahi kullanÄ±cÄ± AspNetUsers'da yoksa reddedilir.
                var userManager = ctx.HttpContext.RequestServices
                    .GetRequiredService<UserManager<AppUser>>();
                var user = await userManager.FindByIdAsync(userId);
                if (user == null)
                    ctx.Fail("KullanÄ±cÄ± bulunamadÄ± veya hesap silinmiÅŸ.");
            }
        };
    });

    // CORS
    var allowedOrigins = builder.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>() ?? Array.Empty<string>();
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("SubGuardCorsPolicy", policy =>
        {
            if (builder.Environment.IsDevelopment())
            {
                // Development: tüm origin'lere izin ver
                policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
            }
            else if (allowedOrigins.Length > 0)
            {
                // Production / Staging: sadece listelenen origin'lere izin ver
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            }
            // else: AllowedCorsOrigins boş ve ortam production → hiçbir origin'e izin verme (güvenli varsayılan)
        });
    });

    // Rate Limiting: auth â†’ 10 req/dk, user-api â†’ 30 req/dk, global API â†’ 60 req/dk
    builder.Services.AddRateLimiter(options =>
    {
        // SÄ±kÄ± limit: login/register gibi auth endpoint'leri
        options.AddFixedWindowLimiter("auth", limiterOptions =>
        {
            limiterOptions.PermitLimit = 10;
            limiterOptions.Window = TimeSpan.FromMinutes(1);
            limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            limiterOptions.QueueLimit = 0;
        });

        // Orta limit: abonelik, bildirim, rapor endpoint'leri â€” [EnableRateLimiting("user-api")] ile uygulanÄ±r
        options.AddFixedWindowLimiter("user-api", limiterOptions =>
        {
            limiterOptions.PermitLimit = 30;
            limiterOptions.Window = TimeSpan.FromMinutes(1);
            limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            limiterOptions.QueueLimit = 0;
        });

        // Global limit: tÃ¼m API endpoint'lerine uygulanÄ±r
        options.GlobalLimiter = System.Threading.RateLimiting.PartitionedRateLimiter.Create<Microsoft.AspNetCore.Http.HttpContext, string>(ctx =>
            System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: ctx.User?.Identity?.Name ?? ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
                factory: _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
                {
                    PermitLimit = 60,
                    Window = TimeSpan.FromMinutes(1),
                    AutoReplenishment = true
                }));

        options.RejectionStatusCode = 429;
    });

    builder.Services.AddHttpContextAccessor();
    builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
    builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
    builder.Services.AddScoped<ICatalogRepository, CatalogRepository>();
    builder.Services.AddMemoryCache();

    // 2. Decorator Pattern Uygulamasï¿½
    // ï¿½nce asï¿½l servisi (Concrete) kaydediyoruz.
    builder.Services.AddScoped<CatalogService>();

    // Sonra Interface istendiï¿½inde Decorator dï¿½necek ï¿½ekilde ayarlï¿½yoruz.
    builder.Services.AddScoped<ICatalogService>(provider =>
    {
        // Asï¿½l servisin instance'ï¿½nï¿½ al
        var actualService = provider.GetRequiredService<CatalogService>();
        // Cache mekanizmasï¿½nï¿½ al
        var memoryCache = provider.GetRequiredService<IMemoryCache>();

        // Decorator iï¿½ine asï¿½l servisi ve cache'i vererek instance oluï¿½tur
        return new SubGuard.Service.Services.Decorators.CachedCatalogService(actualService, memoryCache);
    });
    // DB-backed revocation store: sunucu restart / Ã§oklu instance senaryolarÄ±nda da Ã§alÄ±ÅŸÄ±r
    builder.Services.AddSingleton<IRevokedUserStore, DbRevokedUserStore>();
    builder.Services.AddScoped<IReportService, ReportService>();
    builder.Services.AddScoped<IUserSubscriptionService, UserSubscriptionService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<ITokenService, TokenService>();
    builder.Services.AddScoped<IUserProfileService, UserProfileService>();
    builder.Services.AddScoped<INotificationService, NotificationService>();
    builder.Services.AddScoped<IDashboardService, DashboardService>();
    builder.Services.AddScoped<IAdminService, AdminService>();
    builder.Services.AddScoped<ICategoryBudgetService, CategoryBudgetService>();
    builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
    builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
    builder.Services.AddHttpClient("expo");
    builder.Services.AddScoped<IPushNotificationSender, ExpoPushNotificationSender>();

    // INotificationSender adaptÃ¶rleri â€” NotificationService IEnumerable<INotificationSender> ile tÃ¼m kanallarÄ± tetikler
    builder.Services.AddScoped<INotificationSender, EmailNotificationSender>();
    builder.Services.AddScoped<INotificationSender, PushNotificationSender>();
    // 1. HANGFIRE KONFï¿½Gï¿½RASYONU
    builder.Services.AddHangfire(config => config
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

    // Hangfire Server'ï¿½ ekle (Arka planda iï¿½leri yï¿½rï¿½tecek sunucu)
    builder.Services.AddHangfireServer();
    builder.Services.AddAutoMapper(typeof(MapProfile));

    var app = builder.Build();

    // Zorunlu yapÄ±landÄ±rma deÄŸerlerini kontrol et â€” eksikse uygulama baÅŸlamadan hata ver
    var requiredConfig = new Dictionary<string, string>
    {
        ["ConnectionStrings:DefaultConnection"] = "VeritabanÄ± baÄŸlantÄ± dizesi",
        ["JwtSettings:SecretKey"]              = "JWT gizli anahtarÄ±"
    };

    foreach (var (key, label) in requiredConfig)
    {
        if (string.IsNullOrWhiteSpace(app.Configuration[key]))
            throw new InvalidOperationException(
                $"Zorunlu yapÄ±landÄ±rma eksik: '{label}' ({key}). " +
                "LÃ¼tfen 'dotnet user-secrets set' veya environment variable kullanÄ±n.");
    }

    // S-6: Production ortamÄ±nda CORS konfigÃ¼re edilmemiÅŸse baÅŸlatmayÄ± durdur
    if (!app.Environment.IsDevelopment())
    {
        var corsOrigins = app.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>() ?? Array.Empty<string>();
        if (corsOrigins.Length == 0)
            throw new InvalidOperationException(
                "GÃœVENLÄ°K HATASI: Production ortamÄ±nda 'AllowedCorsOrigins' yapÄ±landÄ±rÄ±lmamÄ±ÅŸ. " +
                "appsettings.Production.json dosyasÄ±na izin verilen origin'leri ekleyin. " +
                "Ã–rnek: \"AllowedCorsOrigins\": [\"https://app.subguard.com\"]");
    }

    // Admin rolÃ¼nÃ¼ seed et
    using (var scope = app.Services.CreateScope())
    {
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        if (!await roleManager.RoleExistsAsync("Admin"))
            await roleManager.CreateAsync(new IdentityRole("Admin"));
    }


    // 3. HTTP ï¿½stek Loglama (Request Logging)
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // --- RECURRING JOB: Gï¿½NLï¿½K KUR Gï¿½NCELLEME ---
    // Her sabah 08:00'de kurlarï¿½ gï¿½ncelle
    // Static RecurringJob yerine DI-based IRecurringJobManager kullanÄ±lÄ±yor.
    // .NET Core'da JobStorage.Current statik API'si kullanÄ±lmamalÄ±.
    var recurringJobManager = app.Services.GetRequiredService<IRecurringJobManager>();

    // Türkiye saati (UTC+3). Windows: "Turkey Standard Time", Linux: "Europe/Istanbul"
    var trTimeZone = TimeZoneInfo.GetSystemTimeZones()
        .FirstOrDefault(tz => tz.Id == "Turkey Standard Time" || tz.Id == "Europe/Istanbul")
        ?? TimeZoneInfo.Utc;

    recurringJobManager.AddOrUpdate<ICurrencyService>(
        "daily-currency-update",
        service => service.UpdateRatesAsync(),
        "0 8 * * *", // Cron: Her gün saat 08:00
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    // Recurring Job Tanımı
    // ServiceProvider üzerinden servisi çağırmamız gerekebilir veya Hangfire Activator kullanır.
    // Basitçe RecurringJob.AddOrUpdate metodu generic tip desteği ile DI container'ı kullanır.

    // Her saat baÅŸÄ± Ã§alÄ±ÅŸÄ±r; iÃ§ filtre kullanÄ±cÄ±nÄ±n NotifyHour'una bakarak uygun kullanÄ±cÄ±larÄ± seÃ§er
    recurringJobManager.AddOrUpdate<INotificationService>(
        "daily-payment-check",
        service => service.CheckAndQueueUpcomingPaymentsAsync(),
        "0 * * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    // #12: Kontrat sona erme â€” 7 gÃ¼n ve 1 gÃ¼n Ã¶ncesi uyarÄ± (saatlik, NotifyHour filtreli)
    recurringJobManager.AddOrUpdate<INotificationService>(
        "daily-contract-expiry-7d",
        service => service.CheckAndQueueContractExpiriesAsync(7),
        "0 * * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    recurringJobManager.AddOrUpdate<INotificationService>(
        "daily-contract-expiry-1d",
        service => service.CheckAndQueueContractExpiriesAsync(1),
        "0 * * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    // #11: BÃ¼tÃ§e aÅŸÄ±m kontrolÃ¼ â€” her gÃ¼n 09:00.
    // Servis iÃ§indeki startOfMonth filtresi aynÄ± ay iÃ§in tekrar bildirim gÃ¶nderilmesini Ã¶nler.
    // BÃ¶ylece kullanÄ±cÄ± ayÄ±n ortasÄ±nda limit aÅŸarsa aynÄ± gÃ¼n uyarÄ± alÄ±r.
    recurringJobManager.AddOrUpdate<INotificationService>(
        "monthly-budget-alert",
        service => service.CheckAndQueueBudgetAlertsAsync(),
        "0 9 * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    // Bildirim kuyruÄŸu iÅŸleme: CheckAndQueue ile aynÄ± saatlik sÄ±klÄ±kta Ã§alÄ±ÅŸÄ±r,
    // bÃ¶ylece NotifyHour=18 gibi seÃ§imlerde bildirim aynÄ± saat iÅŸlenir.
    recurringJobManager.AddOrUpdate<INotificationService>(
        "process-notification-queue",
        service => service.ProcessNotificationQueueAsync(),
        "0 * * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    recurringJobManager.AddOrUpdate<ITokenService>(
        "purge-expired-refresh-tokens",
        service => service.PurgeExpiredRefreshTokensAsync(),
        Cron.Daily // Her gece 00:00 (UTC)
    );

    app.UseHttpsRedirection();
    app.UseCors("SubGuardCorsPolicy");

    // Global Exception Middleware: CORS'tan sonra konumlandırılmalı, böylece hata yanıtlarında
    // Access-Control-Allow-Origin başlığı doğru şekilde eklenir.
    app.UseMiddleware<SubGuard.API.Middlewares.GlobalExceptionMiddleware>();
    app.UseAuthentication();
    // UserName Enrichment: UseAuthentication'dan sonra Ã§alÄ±ÅŸmalÄ± ki User dolu olsun
    app.Use(async (context, next) =>
    {
        var username = context.User?.Identity?.IsAuthenticated == true
            ? context.User.Identity.Name
            : "Anonymous";

        using (Serilog.Context.LogContext.PushProperty("UserName", username))
        {
            await next();
        }
    });
    app.UseAuthorization();
    // UseRateLimiter, UseAuthentication + UseAuthorization'dan SONRA Ã§aÄŸrÄ±lmalÄ±.
    // Aksi hÃ¢lde "user-api" policy'si User.Identity'ye eriÅŸemez ve auth-based
    // rate limiting Ã§alÄ±ÅŸmaz; brute-force korumasÄ± devre dÄ±ÅŸÄ± kalÄ±r.
    app.UseRateLimiter();

    // Hangfire Dashboard: UseAuthentication + UseAuthorization'dan SONRA Ã§aÄŸrÄ±lmalÄ±.
    // Aksi hÃ¢lde HttpContext.User dolu olmaz ve rol kontrolÃ¼ her zaman false dÃ¶ner.
    // Development: localhost'a ek olarak Admin rolÃ¼ de kontrol edilir.
    // Production: yalnÄ±zca geÃ§erli JWT token'Ä± olan Admin rolÃ¼ndeki kullanÄ±cÄ±lar girebilir.
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = app.Environment.IsDevelopment()
            ? new IDashboardAuthorizationFilter[]
              {
                  new LocalRequestsOnlyAuthorizationFilter(),
                  new SubGuard.API.Middlewares.HangfireAdminAuthorizationFilter()
              }
            : new IDashboardAuthorizationFilter[]
              {
                  new SubGuard.API.Middlewares.HangfireAdminAuthorizationFilter()
              }
    });

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Uygulama beklenmedik bir hatayla sonlandï¿½ (Host Terminated).");
}
finally
{
    Log.CloseAndFlush();
}
