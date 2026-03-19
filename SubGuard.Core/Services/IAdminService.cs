using SubGuard.Core.DTOs;

namespace SubGuard.Core.Services
{
    public interface IAdminService
    {
        /// <summary>Tüm kullanıcıları sayfalı listeler; opsiyonel arama: e-posta veya ad üzerinden.</summary>
        Task<CustomResponseDto<PagedResponseDto<AdminUserDto>>> GetUsersAsync(string? search, int page, int pageSize);

        /// <summary>Tek kullanıcı detayı.</summary>
        Task<CustomResponseDto<AdminUserDto>> GetUserDetailAsync(string userId);

        /// <summary>Kullanıcının girişini engeller (LockoutEnd = MaxValue).</summary>
        Task<CustomResponseDto<bool>> DeactivateUserAsync(string userId);

        /// <summary>Kullanıcının kilidini kaldırır.</summary>
        Task<CustomResponseDto<bool>> ActivateUserAsync(string userId);

        /// <summary>Sistem geneli istatistikler.</summary>
        Task<CustomResponseDto<AdminStatsDto>> GetStatsAsync();
    }
}
