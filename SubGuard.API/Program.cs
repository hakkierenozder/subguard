using FluentValidation;
using FluentValidation.AspNetCore;
using Hangfire;
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

// 1. Serilog Kurulumu (Builder'dan �nce)
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(new ConfigurationBuilder()
        .AddJsonFile("appsettings.json")
        .Build())
    .Enrich.FromLogContext()
    .CreateLogger();

try
{
    Log.Information("Uygulama ba�lat�l�yor...");

    var builder = WebApplication.CreateBuilder(args);

    // --- POLLY POLICY TANIMLARI ---
    // 1. Retry Policy: Hata al�rsa 3 kez, 2'�er saniye arayla dene.
    var retryPolicy = HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(2));

    // 2. Circuit Breaker: Ard���k 5 hatadan sonra 30 saniye sistemi kapat (devreyi kes).
    var circuitBreakerPolicy = HttpPolicyExtensions
        .HandleTransientHttpError()
        .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30));

    // FrankfurterExchangeRateProvider'ı HttpClient + Polly politikalarıyla kaydet
    builder.Services.AddHttpClient<IExchangeRateProvider, FrankfurterExchangeRateProvider>(client =>
    {
        client.BaseAddress = new Uri("https://api.frankfurter.app/");
    })
    .AddPolicyHandler(retryPolicy)
    .AddPolicyHandler(circuitBreakerPolicy);

    builder.Services.AddScoped<ICurrencyService, CurrencyService>();

    // 2. Host'a Serilog'u ba�la
    builder.Host.UseSerilog();

    // --- MEVCUT SERV�S KAYITLARI (De�i�iklik Yok) ---
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

        // Account Lockout: 5 hatalı denemede 15 dakika kilitle
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
        var key = Convert.FromBase64String(jwtSettings["SecretKey"]);

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };

        // Silinen/iptal edilmiş kullanıcıların token'larını reddet
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async ctx =>
            {
                var userId = ctx.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null) return;

                // 1. Katman: In-memory revoke store (hızlı — hesap silme anında set edilir)
                var revokedStore = ctx.HttpContext.RequestServices
                    .GetRequiredService<IRevokedUserStore>();
                if (revokedStore.IsRevoked(userId))
                {
                    ctx.Fail("Token geçersiz kılınmış.");
                    return;
                }

                // 2. Katman: DB kontrolü — API yeniden başlatılsa bile silinmiş kullanıcıyı yakalar.
                // In-memory cache sıfırlansa dahi kullanıcı AspNetUsers'da yoksa reddedilir.
                var userManager = ctx.HttpContext.RequestServices
                    .GetRequiredService<UserManager<AppUser>>();
                var user = await userManager.FindByIdAsync(userId);
                if (user == null)
                    ctx.Fail("Kullanıcı bulunamadı veya hesap silinmiş.");
            }
        };
    });

    // CORS
    var allowedOrigins = builder.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>() ?? Array.Empty<string>();
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("SubGuardCorsPolicy", policy =>
        {
            if (builder.Environment.IsDevelopment() || allowedOrigins.Length == 0)
            {
                // Development'ta veya config eksikse tüm origin'lere izin ver
                // Production'da AllowedCorsOrigins dolu olmalı
                policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
            }
            else
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            }
        });
    });

    // Rate Limiting: auth → 10 req/dk, user-api → 30 req/dk, global API → 60 req/dk
    builder.Services.AddRateLimiter(options =>
    {
        // Sıkı limit: login/register gibi auth endpoint'leri
        options.AddFixedWindowLimiter("auth", limiterOptions =>
        {
            limiterOptions.PermitLimit = 10;
            limiterOptions.Window = TimeSpan.FromMinutes(1);
            limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            limiterOptions.QueueLimit = 0;
        });

        // Orta limit: abonelik, bildirim, rapor endpoint'leri — [EnableRateLimiting("user-api")] ile uygulanır
        options.AddFixedWindowLimiter("user-api", limiterOptions =>
        {
            limiterOptions.PermitLimit = 30;
            limiterOptions.Window = TimeSpan.FromMinutes(1);
            limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            limiterOptions.QueueLimit = 0;
        });

        // Global limit: tüm API endpoint'lerine uygulanır
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

    // 2. Decorator Pattern Uygulamas�
    // �nce as�l servisi (Concrete) kaydediyoruz.
    builder.Services.AddScoped<CatalogService>();

    // Sonra Interface istendi�inde Decorator d�necek �ekilde ayarl�yoruz.
    builder.Services.AddScoped<ICatalogService>(provider =>
    {
        // As�l servisin instance'�n� al
        var actualService = provider.GetRequiredService<CatalogService>();
        // Cache mekanizmas�n� al
        var memoryCache = provider.GetRequiredService<IMemoryCache>();

        // Decorator i�ine as�l servisi ve cache'i vererek instance olu�tur
        return new SubGuard.Service.Services.Decorators.CachedCatalogService(actualService, memoryCache);
    });
    // DB-backed revocation store: sunucu restart / çoklu instance senaryolarında da çalışır
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

    // INotificationSender adaptörleri — NotificationService IEnumerable<INotificationSender> ile tüm kanalları tetikler
    builder.Services.AddScoped<INotificationSender, EmailNotificationSender>();
    builder.Services.AddScoped<INotificationSender, PushNotificationSender>();
    // 1. HANGFIRE KONF�G�RASYONU
    builder.Services.AddHangfire(config => config
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

    // Hangfire Server'� ekle (Arka planda i�leri y�r�tecek sunucu)
    builder.Services.AddHangfireServer();
    builder.Services.AddAutoMapper(typeof(MapProfile));

    var app = builder.Build();

    // Zorunlu yapılandırma değerlerini kontrol et — eksikse uygulama başlamadan hata ver
    var requiredConfig = new Dictionary<string, string>
    {
        ["ConnectionStrings:DefaultConnection"] = "Veritabanı bağlantı dizesi",
        ["JwtSettings:SecretKey"]              = "JWT gizli anahtarı"
    };

    foreach (var (key, label) in requiredConfig)
    {
        if (string.IsNullOrWhiteSpace(app.Configuration[key]))
            throw new InvalidOperationException(
                $"Zorunlu yapılandırma eksik: '{label}' ({key}). " +
                "Lütfen 'dotnet user-secrets set' veya environment variable kullanın.");
    }

    // S-6: Production ortamında CORS konfigüre edilmemişse uyar
    if (!app.Environment.IsDevelopment())
    {
        var corsOrigins = app.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>() ?? Array.Empty<string>();
        if (corsOrigins.Length == 0)
            Log.Warning("GÜVENLİK UYARISI: Production ortamında 'AllowedCorsOrigins' yapılandırılmamış. " +
                        "Tüm origin'lere CORS izni veriliyor. appsettings.Production.json'ı güncelleyin.");
    }

    // Admin rolünü seed et
    using (var scope = app.Services.CreateScope())
    {
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        if (!await roleManager.RoleExistsAsync("Admin"))
            await roleManager.CreateAsync(new IdentityRole("Admin"));
    }


    // 3. HTTP �stek Loglama (Request Logging)
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // 2. HANGFIRE DASHBOARD VE JOB TANIMI
    app.UseHangfireDashboard("/hangfire"); // Dashboard'a /hangfire adresinden eri�ilebilir



    // --- RECURRING JOB: G�NL�K KUR G�NCELLEME ---
    // Her sabah 08:00'de kurlar� g�ncelle
    RecurringJob.AddOrUpdate<ICurrencyService>(
        "daily-currency-update",
        service => service.UpdateRatesAsync(),
        "0 8 * * *" // Cron: Her g�n saat 08:00
    );

    // Recurring Job Tan�m�
    // ServiceProvider �zerinden servisi �a��rmam�z gerekebilir veya Hangfire Activator kullan�r.
    // Basit�e RecurringJob.AddOrUpdate metodu generic tip deste�i ile DI container'� kullan�r.

    // Türkiye saati (UTC+3). Windows: "Turkey Standard Time", Linux: "Europe/Istanbul"
    var trTimeZone = TimeZoneInfo.GetSystemTimeZones()
        .FirstOrDefault(tz => tz.Id == "Turkey Standard Time" || tz.Id == "Europe/Istanbul")
        ?? TimeZoneInfo.Utc;

    // Her saat başı çalışır; iç filtre kullanıcının NotifyHour'una bakarak uygun kullanıcıları seçer
    RecurringJob.AddOrUpdate<INotificationService>(
        "daily-payment-check",
        service => service.CheckAndQueueUpcomingPaymentsAsync(3),
        "0 * * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    // #12: Kontrat sona erme — 7 gün ve 1 gün öncesi uyarı (saatlik, NotifyHour filtreli)
    RecurringJob.AddOrUpdate<INotificationService>(
        "daily-contract-expiry-7d",
        service => service.CheckAndQueueContractExpiriesAsync(7),
        "0 * * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    RecurringJob.AddOrUpdate<INotificationService>(
        "daily-contract-expiry-1d",
        service => service.CheckAndQueueContractExpiriesAsync(1),
        "0 * * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    // #11: Bütçe aşım kontrolü — her gün 09:00.
    // Servis içindeki startOfMonth filtresi aynı ay için tekrar bildirim gönderilmesini önler.
    // Böylece kullanıcı ayın ortasında limit aşarsa aynı gün uyarı alır.
    RecurringJob.AddOrUpdate<INotificationService>(
        "monthly-budget-alert",
        service => service.CheckAndQueueBudgetAlertsAsync(),
        "0 9 * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    // Bildirim kuyruğu işleme: CheckAndQueue ile aynı saatlik sıklıkta çalışır,
    // böylece NotifyHour=18 gibi seçimlerde bildirim aynı saat işlenir.
    RecurringJob.AddOrUpdate<INotificationService>(
        "process-notification-queue",
        service => service.ProcessNotificationQueueAsync(),
        "0 * * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    RecurringJob.AddOrUpdate<ITokenService>(
        "purge-expired-refresh-tokens",
        service => service.PurgeExpiredRefreshTokensAsync(),
        Cron.Daily // Her gece 00:00 (UTC)
    );

    // Global Exception Middleware (Mevcut yap�n korunuyor)
    // Serilog ILogger implemente etti�i i�in Middleware i�indeki _logger.LogError otomatik olarak Serilog'a yazar.
    app.UseMiddleware<SubGuard.API.Middlewares.GlobalExceptionMiddleware>();

    app.UseHttpsRedirection();
    app.UseRateLimiter();
    app.UseCors("SubGuardCorsPolicy");
    app.UseAuthentication();
    // ---> YEN� EKLENECEK BLOK BA�LANGI� (UserName Enrichment)
    app.Use(async (context, next) =>
    {
        var username = context.User?.Identity?.IsAuthenticated == true
            ? context.User.Identity.Name
            : "Anonymous"; // Giri� yapmam��sa Anonim yazs�n

        // LogContext'e "UserName" �zelli�ini itiyoruz
        using (Serilog.Context.LogContext.PushProperty("UserName", username))
        {
            await next();
        }
    });
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Uygulama beklenmedik bir hatayla sonland� (Host Terminated).");
}
finally
{
    Log.CloseAndFlush();
}