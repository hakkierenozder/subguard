using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;
using SubGuard.Core.Entities;
using SubGuard.Core.Helpers;
using SubGuard.Core.Services;
using System.Text;

namespace SubGuard.Service.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IEmailSender _emailSender;
        private readonly IMemoryCache _cache;
        private readonly ILogger<AuthService> _logger;

        // Cache key prefix — çakışmayı önler
        private const string OtpCachePrefix = "email_otp:";
        private static readonly TimeSpan OtpTtl = TimeSpan.FromMinutes(15);

        public AuthService(
            UserManager<AppUser> userManager,
            ITokenService tokenService,
            IEmailSender emailSender,
            IMemoryCache cache,
            ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _emailSender = emailSender;
            _cache = cache;
            _logger = logger;
        }

        public async Task<CustomResponseDto<string>> RegisterAsync(RegisterDto registerDto)
        {
            var user = new AppUser
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FullName = registerDto.FullName
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(x => x.Description).ToList();
                _logger.LogWarning("Kayıt başarısız. Email: {Email}. Hatalar: {Errors}",
                    PiiSanitizer.MaskEmail(registerDto.Email), string.Join(", ", errors));
                return CustomResponseDto<string>.Fail(400, errors);
            }

            await SendConfirmationEmailAsync(user);

            _logger.LogInformation("Yeni kullanıcı kaydı oluşturuldu. Email: {Email}",
                PiiSanitizer.MaskEmail(user.Email));

            // UserId frontend'e döner — doğrulama ekranına yönlendirmek için gerekli
            return CustomResponseDto<string>.Success(200, user.Id);
        }

        public async Task<CustomResponseDto<TokenDto>> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);

            if (user == null)
                return CustomResponseDto<TokenDto>.Fail(404, "Kullanıcı bulunamadı.");

            if (await _userManager.IsLockedOutAsync(user))
            {
                _logger.LogWarning("Kilitli hesaba giriş denemesi. Email: {Email}",
                    PiiSanitizer.MaskEmail(loginDto.Email));
                return CustomResponseDto<TokenDto>.Fail(423, "Çok fazla hatalı giriş denemesi yapıldı. Hesabınız 15 dakika süreyle kilitlendi.");
            }

            var checkPassword = await _userManager.CheckPasswordAsync(user, loginDto.Password);

            if (!checkPassword)
            {
                await _userManager.AccessFailedAsync(user);
                _logger.LogWarning("Başarısız giriş denemesi. Email: {Email}",
                    PiiSanitizer.MaskEmail(loginDto.Email));
                return CustomResponseDto<TokenDto>.Fail(400, "E-posta veya şifre hatalı.");
            }

            if (!user.EmailConfirmed)
            {
                _logger.LogWarning("Doğrulanmamış e-posta ile giriş denemesi. Email: {Email}",
                    PiiSanitizer.MaskEmail(loginDto.Email));
                return CustomResponseDto<TokenDto>.Fail(403, "E-posta adresiniz henüz doğrulanmamış. Lütfen e-postanızı kontrol edin.");
            }

            await _userManager.ResetAccessFailedCountAsync(user);
            _logger.LogInformation("Kullanıcı giriş yaptı. Email: {Email}",
                PiiSanitizer.MaskEmail(user.Email));
            return await _tokenService.CreateTokenAsync(user);
        }

        public async Task<CustomResponseDto<bool>> ConfirmEmailAsync(string userId, string otp)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            // Cache'den OTP → gerçek token eşleşmesini al
            var cacheKey = OtpCachePrefix + userId;
            if (!_cache.TryGetValue(cacheKey, out string? cached) || cached == null)
                return CustomResponseDto<bool>.Fail(400, "Doğrulama kodu geçersiz veya süresi dolmuş. Lütfen yeniden kayıt olun.");

            var parts = cached.Split('|', 2);
            if (parts.Length != 2 || parts[0] != otp.Trim())
                return CustomResponseDto<bool>.Fail(400, "Doğrulama kodu hatalı.");

            var encodedToken = parts[1];
            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(encodedToken));
            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(x => x.Description).ToList();
                _logger.LogWarning("E-posta doğrulama başarısız. UserId: {UserId}", userId);
                return CustomResponseDto<bool>.Fail(400, errors);
            }

            // Başarılı doğrulama sonrası OTP'yi cache'den temizle
            _cache.Remove(cacheKey);

            _logger.LogInformation("E-posta doğrulandı. Email: {Email}",
                PiiSanitizer.MaskEmail(user.Email));
            return CustomResponseDto<bool>.Success(200, true);
        }

        // ─── Private helpers ───────────────────────────────────────────────────────

        private async Task SendConfirmationEmailAsync(AppUser user)
        {
            var rawToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(rawToken));

            // 6 haneli OTP üret (100000–999999)
            var otp = Random.Shared.Next(100000, 1000000).ToString();

            // OTP → gerçek token eşleşmesini 15 dk cache'le
            var cacheKey = OtpCachePrefix + user.Id;
            _cache.Set(cacheKey, $"{otp}|{encodedToken}", OtpTtl);

            try
            {
                var body = $@"<!DOCTYPE html>
<html>
<body style=""font-family:Arial,sans-serif;background:#f4f4f4;padding:24px;"">
  <div style=""max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;"">
    <h2 style=""color:#6C63FF;margin-top:0;"">SubGuard — E-posta Doğrulama</h2>
    <p>Merhaba <b>{user.FullName}</b>,</p>
    <p>Hesabınızı doğrulamak için aşağıdaki <b>6 haneli kodu</b> SubGuard uygulamasına girin:</p>
    <div style=""background:#f0eeff;border-radius:8px;padding:24px;text-align:center;margin:24px 0;"">
      <p style=""margin:0 0 8px;font-size:13px;color:#666;"">Doğrulama Kodunuz</p>
      <p style=""margin:0;font-size:36px;font-weight:bold;color:#6C63FF;letter-spacing:10px;"">{otp}</p>
    </div>
    <p style=""font-size:13px;color:#888;"">Bu kod <b>15 dakika</b> geçerlidir.</p>
    <p style=""font-size:12px;color:#aaa;margin-bottom:0;"">Bu e-postayı siz talep etmediyseniz güvenle yok sayabilirsiniz.</p>
  </div>
</body>
</html>";

                await _emailSender.SendAsync(user.Email!, user.FullName!, "SubGuard — E-posta Doğrulama", body);
            }
            catch (Exception ex)
            {
                // SMTP yapılandırılmamışsa logla ama kaydı iptal etme
                _logger.LogWarning(ex,
                    "Doğrulama e-postası gönderilemedi. UserId: {UserId}", user.Id);
            }
        }
    }
}
