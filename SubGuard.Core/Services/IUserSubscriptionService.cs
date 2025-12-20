using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;

namespace SubGuard.Core.Services
{
    // Generic Service kullanmıyorsak custom tanımlayalım
    public interface IUserSubscriptionService
    {
        Task<CustomResponseDto<List<UserSubscriptionDto>>> GetUserSubscriptionsAsync(string userId);
        Task<CustomResponseDto<UserSubscriptionDto>> AddSubscriptionAsync(UserSubscriptionDto dto);
        Task<CustomResponseDto<bool>> RemoveSubscriptionAsync(int id);
    }
}