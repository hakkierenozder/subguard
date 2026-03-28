using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;

namespace SubGuard.Core.Services
{
    /// <summary>
    /// Yalnızca kimlik doğrulama (register + login) sorumluluğu.
    /// Token yönetimi → ITokenService
    /// Profil/hesap yönetimi → IUserProfileService
    /// </summary>
    public interface IAuthService
    {
        /// <summary>Başarılı olursa data alanında yeni kullanıcının Id'sini döner.</summary>
        Task<CustomResponseDto<string>> RegisterAsync(RegisterDto registerDto);
        Task<CustomResponseDto<TokenDto>> LoginAsync(LoginDto loginDto);
        Task<CustomResponseDto<bool>> ConfirmEmailAsync(string userId, string token);
        /// <summary>E-posta adresine OTP gönderir; başarıda data alanında userId döner.</summary>
        Task<CustomResponseDto<string>> ForgotPasswordAsync(string email);
        /// <summary>OTP + yeni şifre ile şifre sıfırlar.</summary>
        Task<CustomResponseDto<bool>> ResetPasswordAsync(string userId, string otp, string newPassword);
        /// <summary>
        /// E-posta doğrulama kodunu tekrar gönderir.
        /// Kullanıcı bulunamasa, zaten doğrulanmış olsa veya rate-limit aşılsa dahi her zaman 200 döner (enumeration önlemi).
        /// </summary>
        Task<CustomResponseDto<bool>> ResendConfirmationEmailAsync(string email);
    }
}
