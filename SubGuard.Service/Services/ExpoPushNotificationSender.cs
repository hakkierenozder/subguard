using Microsoft.Extensions.Logging;
using SubGuard.Core.Services;
using System.Text;
using System.Text.Json;

namespace SubGuard.Service.Services
{
    public class ExpoPushNotificationSender : IPushNotificationSender
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ExpoPushNotificationSender> _logger;

        private const string ExpoApiUrl = "https://exp.host/--/api/v2/push/send";

        public ExpoPushNotificationSender(IHttpClientFactory httpClientFactory, ILogger<ExpoPushNotificationSender> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task SendAsync(string expoPushToken, string title, string body, object? data = null)
        {
            if (string.IsNullOrEmpty(expoPushToken))
                return;

            var payload = new
            {
                to = expoPushToken,
                title,
                body,
                data = data ?? new { },
                sound = "default",
                priority = "high"
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                var client = _httpClientFactory.CreateClient("expo");
                var response = await client.PostAsync(ExpoApiUrl, content);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Expo push bildirimi gönderilemedi. Token: {Token}, Hata: {Error}",
                        expoPushToken[..Math.Min(20, expoPushToken.Length)], error);
                }
                else
                {
                    _logger.LogInformation("Push bildirimi gönderildi. Token: {Token}",
                        expoPushToken[..Math.Min(20, expoPushToken.Length)]);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Expo push bildirimi gönderilemedi. Token: {Token}",
                    expoPushToken[..Math.Min(20, expoPushToken.Length)]);
            }
        }
    }
}
