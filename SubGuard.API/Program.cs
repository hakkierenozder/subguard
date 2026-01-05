using FluentValidation;
using FluentValidation.AspNetCore;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using Polly;
using Polly.Extensions.Http;
using SabGuard.Data.Repositories;
using SabGuard.Data.UnitOfWork;
using Serilog; // <--- EKLENDÝ
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;
using SubGuard.Core.UnitOfWork;
using SubGuard.Data.Repositories;
using SubGuard.Service.Mapping;
using SubGuard.Service.Services;
using SubGuard.Service.Validations;
using System.Reflection;

// 1. Serilog Kurulumu (Builder'dan önce)
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(new ConfigurationBuilder()
        .AddJsonFile("appsettings.json")
        .Build())
    .Enrich.FromLogContext()
    .CreateLogger();

try
{
    Log.Information("Uygulama baþlatýlýyor...");

    var builder = WebApplication.CreateBuilder(args);

    // --- POLLY POLICY TANIMLARI ---
    // 1. Retry Policy: Hata alýrsa 3 kez, 2'þer saniye arayla dene.
    var retryPolicy = HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(2));

    // 2. Circuit Breaker: Ardýþýk 5 hatadan sonra 30 saniye sistemi kapat (devreyi kes).
    var circuitBreakerPolicy = HttpPolicyExtensions
        .HandleTransientHttpError()
        .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30));

    // CurrencyService'i HttpClient ile baðla ve Policy'leri ekle
    builder.Services.AddHttpClient<ICurrencyService, CurrencyService>(client =>
    {
        client.BaseAddress = new Uri("https://api.frankfurter.app/");
    })
    .AddPolicyHandler(retryPolicy)
    .AddPolicyHandler(circuitBreakerPolicy);

    // 2. Host'a Serilog'u baðla
    builder.Host.UseSerilog();

    // --- MEVCUT SERVÝS KAYITLARI (Deðiþiklik Yok) ---
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
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequiredLength = 6;
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

    builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
    builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
    builder.Services.AddScoped<ICatalogRepository, CatalogRepository>();
    builder.Services.AddMemoryCache();

    // 2. Decorator Pattern Uygulamasý
    // Önce asýl servisi (Concrete) kaydediyoruz.
    builder.Services.AddScoped<CatalogService>();

    // Sonra Interface istendiðinde Decorator dönecek þekilde ayarlýyoruz.
    builder.Services.AddScoped<ICatalogService>(provider =>
    {
        // Asýl servisin instance'ýný al
        var actualService = provider.GetRequiredService<CatalogService>();
        // Cache mekanizmasýný al
        var memoryCache = provider.GetRequiredService<IMemoryCache>();

        // Decorator içine asýl servisi ve cache'i vererek instance oluþtur
        return new SubGuard.Service.Services.Decorators.CachedCatalogService(actualService, memoryCache);
    });
    builder.Services.AddScoped<IUserSubscriptionService, UserSubscriptionService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<INotificationService, NotificationService>();
    // 1. HANGFIRE KONFÝGÜRASYONU
    builder.Services.AddHangfire(config => config
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

    // Hangfire Server'ý ekle (Arka planda iþleri yürütecek sunucu)
    builder.Services.AddHangfireServer();
    builder.Services.AddAutoMapper(typeof(MapProfile));

    var app = builder.Build();



    // 3. HTTP Ýstek Loglama (Request Logging)
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // 2. HANGFIRE DASHBOARD VE JOB TANIMI
    app.UseHangfireDashboard("/hangfire"); // Dashboard'a /hangfire adresinden eriþilebilir



    // --- RECURRING JOB: GÜNLÜK KUR GÜNCELLEME ---
    // Her sabah 08:00'de kurlarý güncelle
    RecurringJob.AddOrUpdate<ICurrencyService>(
        "daily-currency-update",
        service => service.UpdateRatesAsync(),
        "0 8 * * *" // Cron: Her gün saat 08:00
    );

    // Recurring Job Tanýmý
    // ServiceProvider üzerinden servisi çaðýrmamýz gerekebilir veya Hangfire Activator kullanýr.
    // Basitçe RecurringJob.AddOrUpdate metodu generic tip desteði ile DI container'ý kullanýr.

    RecurringJob.AddOrUpdate<INotificationService>(
        "daily-payment-check",
        service => service.CheckAndQueueUpcomingPaymentsAsync(3), // 3 gün öncesi
        Cron.Daily // Her gece 00:00 (UTC)
    );

    // Global Exception Middleware (Mevcut yapýn korunuyor)
    // Serilog ILogger implemente ettiði için Middleware içindeki _logger.LogError otomatik olarak Serilog'a yazar.
    app.UseMiddleware<SubGuard.API.Middlewares.GlobalExceptionMiddleware>();

    app.UseHttpsRedirection();
    app.UseAuthentication();
    // ---> YENÝ EKLENECEK BLOK BAÞLANGIÇ (UserName Enrichment)
    app.Use(async (context, next) =>
    {
        var username = context.User?.Identity?.IsAuthenticated == true
            ? context.User.Identity.Name
            : "Anonymous"; // Giriþ yapmamýþsa Anonim yazsýn

        // LogContext'e "UserName" özelliðini itiyoruz
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
    Log.Fatal(ex, "Uygulama beklenmedik bir hatayla sonlandý (Host Terminated).");
}
finally
{
    Log.CloseAndFlush();
}