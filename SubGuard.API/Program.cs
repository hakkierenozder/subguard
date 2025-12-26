using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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
    builder.Services.AddScoped<ICatalogService, CatalogService>();
    builder.Services.AddScoped<IUserSubscriptionService, UserSubscriptionService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddAutoMapper(typeof(MapProfile));

    var app = builder.Build();

    // 3. HTTP Ýstek Loglama (Request Logging)
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

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