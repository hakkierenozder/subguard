namespace SubGuard.Core.Services
{
    public interface IPushNotificationSender
    {
        Task SendAsync(string expoPushToken, string title, string body, object? data = null);
    }
}
