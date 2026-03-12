using System.Text.Json.Serialization;

namespace SubGuard.Core.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum BillingPeriod
    {
        Monthly = 1,
        Yearly = 2
    }
}
