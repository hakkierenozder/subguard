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
    });

    // CORS
    var allowedOrigins = builder.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>() ?? Array.Empty<string>();
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("SubGuardCorsPolicy", policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });

    // Rate Limiting: auth endpoint'leri için dakikada 10 istek
    builder.Services.AddRateLimiter(options =>
    {
        options.AddFixedWindowLimiter("auth", limiterOptions =>
        {
            limiterOptions.PermitLimit = 10;
            limiterOptions.Window = TimeSpan.FromMinutes(1);
            limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            limiterOptions.QueueLimit = 0;
        });
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
    builder.Services.AddScoped<IUserSubscriptionService, UserSubscriptionService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<ITokenService, TokenService>();
    builder.Services.AddScoped<IUserProfileService, UserProfileService>();
    builder.Services.AddScoped<INotificationService, NotificationService>();
    builder.Services.AddScoped<IDashboardService, DashboardService>();
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

    RecurringJob.AddOrUpdate<INotificationService>(
        "daily-payment-check",
        service => service.CheckAndQueueUpcomingPaymentsAsync(3), // 3 g�n �ncesi
        Cron.Daily // Her gece 00:00 (UTC)
    );

    RecurringJob.AddOrUpdate<INotificationService>(
        "process-notification-queue",
        service => service.ProcessNotificationQueueAsync(),
        "0 9 * * *" // Her sabah 09:00 (UTC)
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