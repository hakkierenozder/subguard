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
using SubGuard.Core.Constants;
using SubGuard.Core.Repositories;
using SubGuard.Core.Models;
using SubGuard.Core.Services;
using SubGuard.Core.UnitOfWork;
using SubGuard.Service.Mapping;
using SubGuard.Service.Services;
using SubGuard.Service.Validations;
using System.Reflection;
using System.Security.Claims;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

// 1. Serilog Kurulumu (Builder'dan önce)
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(new ConfigurationBuilder()
        .AddJsonFile("appsettings.json")
        .Build())
    .Enrich.FromLogContext()
    .CreateLogger();

try
{
    Log.Information("Uygulama başlatılıyor...");

    var builder = WebApplication.CreateBuilder(args);

    // --- POLLY POLICY TANIMLARI ---
    // 1. Retry Policy: Hata alırsa 3 kez, 2'şer saniye arayla dene.
    var retryPolicy = HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(2));

    // 2. Circuit Breaker: Ardışık 5 hatadan sonra 30 saniye sistemi kapat (devreyi kes).
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

    // 2. Host'a Serilog'u bağla
    builder.Host.UseSerilog();

    // --- MEVCUT SERVİS KAYITLARI (Değişiklik Yok) ---
    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.AddValidatorsFromAssemblyContaining<RegisterDtoValidator>();

    builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
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
    })
    .AddJsonOptions(options =>
    {
        // Enum değerleri sayısal (0, 1...) yerine string ("Monthly", "Yearly") olarak serialize edilir.
        // Frontend string karşılaştırmaları (billingPeriod !== 'Yearly') doğru çalışır.
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
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
            ClockSkew = TimeSpan.FromSeconds(30)  // 30s tolerans: container/mobil saat kayması için yeterli, replay attack penceresi minimal
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

                if (user != null && await userManager.IsLockedOutAsync(user))
                    ctx.Fail("Kullanıcı hesabı askıya alınmış.");
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

        // Orta limit: abonelik, bildirim, rapor endpoint'leri — [EnableRateLimiting(“user-api”)] ile uygulanır
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

    // 2. Decorator Pattern Uygulaması
    // Önce asıl servisi (Concrete) kaydediyoruz.
    builder.Services.AddScoped<CatalogService>();

    // Sonra Interface istendiğinde Decorator dönecek şekilde ayarlıyoruz.
    builder.Services.AddScoped<ICatalogService>(provider =>
    {
        // Asıl servisin instance'ını al
        var actualService = provider.GetRequiredService<CatalogService>();
        // Cache mekanizmasını al
        var memoryCache = provider.GetRequiredService<IMemoryCache>();

        // Decorator içine asıl servisi ve cache'i vererek instance oluştur
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
    // 1. HANGFIRE KONFİGÜRASYONU
    builder.Services.AddHangfire(config => config
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

    // Hangfire Server'ı ekle (Arka planda işleri yürütecek sunucu)
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

    // S-6: Production ortamında CORS konfigure edilmemişse başlatmayı durdur
    if (!app.Environment.IsDevelopment())
    {
        var corsOrigins = app.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>() ?? Array.Empty<string>();
        if (corsOrigins.Length == 0)
            throw new InvalidOperationException(
                "GÜVENLİK HATASI: Production ortamında 'AllowedCorsOrigins' yapılandırılmamış. " +
                "appsettings.Production.json dosyasına izin verilen origin'leri ekleyin. " +
                "Örnek: \"AllowedCorsOrigins\": [\"https://app.subguard.com\"]");
    }

    // Çalışan API her zaman kendi bağlı olduğu veritabanı şemasıyla hizalı olsun.
    // Özellikle yerel geliştirmede migration unutulduğunda runtime/query drift oluşmasını engeller.
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var pendingMigrations = (await dbContext.Database.GetPendingMigrationsAsync()).ToList();
        if (pendingMigrations.Count > 0)
        {
            Log.Information("Pending EF migration bulundu. Uygulanıyor: {Migrations}", string.Join(", ", pendingMigrations));
            await dbContext.Database.MigrateAsync();
        }

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        if (!await roleManager.RoleExistsAsync("Admin"))
            await roleManager.CreateAsync(new IdentityRole("Admin"));
    }


    // 3. HTTP İstek Loglama (Request Logging)
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // --- RECURRING JOB: GÜNLÜK KUR GÜNCELLEME ---
    // Her sabah 08:00'de kurları güncelle
    // Static RecurringJob yerine DI-based IRecurringJobManager kullanılıyor.
    // .NET Core'da JobStorage.Current statik API'si kullanılmamalı.
    var recurringJobManager = app.Services.GetRequiredService<IRecurringJobManager>();

    var trTimeZone = AppConstants.TimeZones.Turkey;

    recurringJobManager.AddOrUpdate<ICurrencyService>(
        "daily-currency-update",
        service => service.UpdateRatesAsync(),
        "0 8 * * *", // Cron: Her gün saat 08:00
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    // Recurring Job Tanımı
    // ServiceProvider üzerinden servisi çağırmamız gerekebilir veya Hangfire Activator kullanır.
    // Basitçe RecurringJob.AddOrUpdate metodu generic tip desteği ile DI container'ı kullanır.

    // Her saat başı çalışır; iç filtre kullanıcının NotifyHour'una bakarak uygun kullanıcıları seçer
    recurringJobManager.AddOrUpdate<INotificationService>(
        "hourly-payment-check",
        service => service.CheckAndQueueUpcomingPaymentsAsync(),
        "0 * * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    // #12: Kontrat sona erme — 7 gün ve 1 gün öncesi uyarı (saatlik, NotifyHour filtreli)
    recurringJobManager.AddOrUpdate<INotificationService>(
        "hourly-contract-expiry-7d",
        service => service.CheckAndQueueContractExpiriesAsync(7),
        "0 * * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    recurringJobManager.AddOrUpdate<INotificationService>(
        "hourly-contract-expiry-1d",
        service => service.CheckAndQueueContractExpiriesAsync(1),
        "0 * * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    // #11: Bütçe aşım kontrolü — her gün 09:00.
    // Servis içindeki startOfMonth filtresi aynı ay için tekrar bildirim gönderilmesini önler.
    // Böylece kullanıcı ayın ortasında limit aşarsa aynı gün uyarı alır.
    recurringJobManager.AddOrUpdate<INotificationService>(
        "monthly-budget-alert",
        service => service.CheckAndQueueBudgetAlertsAsync(),
        "0 9 * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    // Bildirim kuyruğu işleme: CheckAndQueue ile aynı saatlik sıklıkta çalışır,
    // böylece NotifyHour=18 gibi seçimlerde bildirim aynı saat işlenir.
    recurringJobManager.AddOrUpdate<INotificationService>(
        "hourly-process-notification-queue",
        service => service.ProcessNotificationQueueAsync(),
        "0 * * * *",
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    recurringJobManager.AddOrUpdate<ITokenService>(
        "purge-expired-refresh-tokens",
        service => service.PurgeExpiredRefreshTokensAsync(),
        "0 3 * * *", // Her gece 03:00 TR saati
        new RecurringJobOptions { TimeZone = trTimeZone }
    );

    app.UseHttpsRedirection();
    app.UseCors("SubGuardCorsPolicy");

    app.UseRateLimiter();
    // Global Exception Middleware: RateLimiter'dan sonra konumlandırılmalı; bu sayede
    // rate-limit dışındaki tüm hataları yakalar ve CORS başlıkları da doğru eklenir.
    app.UseMiddleware<SubGuard.API.Middlewares.GlobalExceptionMiddleware>();
    app.UseAuthentication();
    // UserName Enrichment: UseAuthentication'dan sonra çalışmalı ki User dolu olsun
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

    // Hangfire Dashboard: UseAuthentication + UseAuthorization'dan SONRA çağrılmalı.
    // Aksi hâlde HttpContext.User dolu olmaz ve rol kontrolü her zaman false döner.
    // Development: localhost'a ek olarak Admin rolü de kontrol edilir.
    // Production: yalnızca geçerli JWT token'ı olan Admin rolündeki kullanıcılar girebilir.
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        // Development: yalnızca localhost erişimi yeterli — JWT gerektirmez, geliştirici doğrudan açabilir.
        // Production: geçerli Admin JWT token'ı zorunlu.
        Authorization = app.Environment.IsDevelopment()
            ? new IDashboardAuthorizationFilter[]
              {
                  new LocalRequestsOnlyAuthorizationFilter()
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
    Log.Fatal(ex, "Uygulama beklenmedik bir hatayla sonlandı (Host Terminated).");
}
finally
{
    Log.CloseAndFlush();
}
