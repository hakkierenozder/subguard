using System.Threading.Tasks;
using System.Collections.Generic;

namespace SubGuard.Core.Services
{
    public interface ICurrencyService
    {
        // Kurları dış servisten çekip Cache'e atar
        Task UpdateRatesAsync();

        // Cache'deki kurları döner
        Task<Dictionary<string, decimal>> GetRatesAsync();
    }
}