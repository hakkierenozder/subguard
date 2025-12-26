using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SabGuard.Data.Repositories;
using SabGuard.Data.UnitOfWork;
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
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterDtoValidator>();

builder.Services.AddControllers().ConfigureApiBehaviorOptions(options =>
{
    // Varsayýlan Filter davranýþýný (otomatik 400 dönüþü) özelleþtiriyoruz.
    options.InvalidModelStateResponseFactory = context =>
    {
        // Validasyon hatalarýný topla
        var errors = context.ModelState.Values
            .Where(v => v.Errors.Count > 0)
            .SelectMany(v => v.Errors)
            .Select(v => v.ErrorMessage)
            .ToList();

        // Kendi DTO formatýmýza çevir
        var responseDto = CustomResponseDto<bool>.Fail(400, errors);

        return new BadRequestObjectResult(responseDto);
    };
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(x =>
{
    x.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), option =>
    {
        // Migration'larýn tutulacaðý proje (Data katmanýnda deðil API katmanýnda çalýþtýrsak bile Assembly Data'dýr)
        option.MigrationsAssembly(Assembly.GetAssembly(typeof(AppDbContext)).GetName().Name);
    });
});

builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.User.RequireUniqueEmail = true;
    options.Password.RequireNonAlphanumeric = false; // Þimdilik basitleþtirelim
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// 3. JWT TOKEN AYARLARI (YENÝ EKLE)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    var key = Convert.FromBase64String(jwtSettings["SecretKey"]); // Base64 çevrimi

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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ---> YENÝ EKLENEN KISIM BAÞLANGIÇ
// Kendi yazdýðýmýz Global Exception Middleware'i devreye alýyoruz.
// Artýk try-catch yazmana gerek yok, burasý tüm hatalarý yakalar.
app.UseMiddleware<SubGuard.API.Middlewares.GlobalExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseAuthentication(); // <-- Kimlik Kontrolü

app.UseAuthorization();

app.MapControllers();

app.Run();
