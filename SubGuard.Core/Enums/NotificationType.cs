using System.Text.Json.Serialization;

namespace SubGuard.Core.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum NotificationType
    {
        Payment = 1,
        Budget = 2,
        Shared = 3,
        Contract = 4
    }
}
