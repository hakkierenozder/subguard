using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;

namespace SubGuard.Core.Services
{
    /// <summary>
    /// Kullanıcı profili ve hesap yönetimi.
    /// Kimlik doğrulama (Register/Login) bu interface'in dışındadır.
    /// </summary>
    public interface IUserProfileService
    {
        Task<CustomResponseDto<UserProfileDto>> GetUserProfileAsync(string userId);
        Task<CustomResponseDto<bool>> UpdateProfileAsync(string userId, UpdateProfileDto dto);
        Task<CustomResponseDto<bool>> ChangePasswordAsync(string userId, ChangePasswordDto dto);

        /// <summary>GDPR: kullanıcının tüm verilerini kalıcı olarak siler.</summary>
        Task<CustomResponseDto<bool>> DeleteAccountAsync(string userId);
    }
}
