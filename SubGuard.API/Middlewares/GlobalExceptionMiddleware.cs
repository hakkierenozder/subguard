using Microsoft.AspNetCore.Diagnostics;
using SubGuard.Core.DTOs;
using SubGuard.Core.Exceptions;
using System.Net;
using System.Text.Json;

namespace SubGuard.API.Middlewares
{
    // Standart bir Middleware değil, IExceptionHandler veya UseExceptionHandler uzantısı olarak tasarlıyoruz.
    // Ancak en kontrol edilebilir yöntem "Custom Middleware Class" yazmaktır.
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        // Logger ekleyerek hataları konsola veya dosyaya basabiliriz.
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // İsteği bir sonraki adıma ilet, sorun yoksa devam eder.
                await _next(context);
            }
            catch (Exception ex)
            {
                // Hata yakalandı!
                _logger.LogError(ex, "Bir hata oluştu: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            int statusCode;
            string message;

            // Hata türüne göre Status Code belirle
            switch (exception)
            {
                case ClientSideException:
                    statusCode = (int)HttpStatusCode.BadRequest; // 400
                    message = exception.Message;
                    break;

                case NotFoundException:
                    statusCode = (int)HttpStatusCode.NotFound; // 404
                    message = exception.Message;
                    break;

                case UnauthorizedAccessException:
                    statusCode = (int)HttpStatusCode.Unauthorized; // 401
                    message = "Bu işlem için yetkiniz yok.";
                    break;

                default:
                    statusCode = (int)HttpStatusCode.InternalServerError; // 500
                    message = "Sunucu kaynaklı bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.";
                    // Prodüksiyonda exception.Message'ı client'a açmak güvenlik riski olabilir, 
                    // ama Development ortamında detay görmek isteyebilirsin.
                    // message = exception.Message; 
                    break;
            }

            context.Response.StatusCode = statusCode;

            // DTO'muzu kullanarak cevabı hazırla. T tipini 'object' veya 'NoContent' verebiliriz.
            var response = CustomResponseDto<object>.Fail(statusCode, message);

            // JSON'a çevir
            var json = JsonSerializer.Serialize(response);

            await context.Response.WriteAsync(json);
        }
    }
}