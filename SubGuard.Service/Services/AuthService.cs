using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
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
        private readonly ILogger<AuthService> _logger;

        // OTP geçerlilik süresi — DB'deki OtpExpiry için kullanılır
        private static readonly TimeSpan OtpTtl = TimeSpan.FromMinutes(15);

        public AuthService(
            UserManager<AppUser> userManager,
            ITokenService tokenService,
            IEmailSender emailSender,
            ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _emailSender = emailSender;
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

            // DB'den OTP doğrula
            if (user.OtpType != "email_confirm"
                || user.OtpCode == null
                || user.OtpToken == null
                || user.OtpExpiry == null
                || user.OtpExpiry < DateTime.UtcNow)
            {
                return CustomResponseDto<bool>.Fail(400, "Doğrulama kodu geçersiz veya süresi dolmuş. Lütfen yeniden kayıt olun.");
            }

            if (user.OtpCode != otp.Trim())
                return CustomResponseDto<bool>.Fail(400, "Doğrulama kodu hatalı.");

            var encodedToken = user.OtpToken;
            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(encodedToken));
            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(x => x.Description).ToList();
                _logger.LogWarning("E-posta doğrulama başarısız. UserId: {UserId}", userId);
                return CustomResponseDto<bool>.Fail(400, errors);
            }

            // Başarılı doğrulama sonrası OTP alanlarını temizle
            user.OtpCode = null;
            user.OtpToken = null;
            user.OtpType = null;
            user.OtpExpiry = null;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("E-posta doğrulandı. Email: {Email}",
                PiiSanitizer.MaskEmail(user.Email));
            return CustomResponseDto<bool>.Success(200, true);
        }

        public async Task<CustomResponseDto<string>> ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email.Trim().ToLower());
            // Güvenlik: kullanıcı bulunamasa da aynı yanıt verilir (e-posta numaralandırma önlemi)
            if (user == null || !user.EmailConfirmed)
            {
                _logger.LogInformation("Şifre sıfırlama isteği: kullanıcı bulunamadı veya e-posta doğrulanmamış. Email: {Email}",
                    PiiSanitizer.MaskEmail(email));
                return CustomResponseDto<string>.Success(200, string.Empty);
            }

            var rawToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(rawToken));
            var otp = Random.Shared.Next(100000, 1000000).ToString();

            // OTP'yi DB'ye yaz
            user.OtpCode = otp;
            user.OtpToken = encodedToken;
            user.OtpType = "pwd_reset";
            user.OtpExpiry = DateTime.UtcNow.Add(OtpTtl);
            await _userManager.UpdateAsync(user);

            try
            {
                var body = $@"<!DOCTYPE html>
<html>
<body style=""font-family:Arial,sans-serif;background:#f4f4f4;padding:24px;"">
  <div style=""max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;"">
    <h2 style=""color:#6C63FF;margin-top:0;"">SubGuard — Şifre Sıfırlama</h2>
    <p>Merhaba <b>{user.FullName}</b>,</p>
    <p>Şifrenizi sıfırlamak için aşağıdaki <b>6 haneli kodu</b> girin:</p>
    <div style=""background:#f0eeff;border-radius:8px;padding:24px;text-align:center;margin:24px 0;"">
      <p style=""margin:0 0 8px;font-size:13px;color:#666;"">Sıfırlama Kodunuz</p>
      <p style=""margin:0;font-size:36px;font-weight:bold;color:#6C63FF;letter-spacing:10px;"">{otp}</p>
    </div>
    <p style=""font-size:13px;color:#888;"">Bu kod <b>15 dakika</b> geçerlidir. Eğer bu isteği siz yapmadıysanız güvenle yok sayabilirsiniz.</p>
  </div>
</body>
</html>";
                await _emailSender.SendAsync(user.Email!, user.FullName!, "SubGuard — Şifre Sıfırlama", body);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Şifre sıfırlama e-postası gönderilemedi. UserId: {UserId}", user.Id);
            }

            _logger.LogInformation("Şifre sıfırlama OTP üretildi. UserId: {UserId}", user.Id);
            return CustomResponseDto<string>.Success(200, user.Id);
        }

        public async Task<CustomResponseDto<bool>> ResetPasswordAsync(string userId, string otp, string newPassword)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            // DB'den OTP doğrula
            if (user.OtpType != "pwd_reset"
                || user.OtpCode == null
                || user.OtpToken == null
                || user.OtpExpiry == null
                || user.OtpExpiry < DateTime.UtcNow)
            {
                return CustomResponseDto<bool>.Fail(400, "Kod geçersiz veya süresi dolmuş. Lütfen tekrar 'Şifremi Unuttum' işlemini başlatın.");
            }

            if (user.OtpCode != otp.Trim())
                return CustomResponseDto<bool>.Fail(400, "Girilen kod hatalı.");

            var encodedToken = user.OtpToken;
            var rawToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(encodedToken));
            var result = await _userManager.ResetPasswordAsync(user, rawToken, newPassword);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(x => x.Description).ToList();
                return CustomResponseDto<bool>.Fail(400, errors);
            }

            // Başarılı sıfırlama sonrası OTP alanlarını temizle
            user.OtpCode = null;
            user.OtpToken = null;
            user.OtpType = null;
            user.OtpExpiry = null;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("Şifre sıfırlandı. UserId: {UserId}", userId);
            return CustomResponseDto<bool>.Success(200, true);
        }

        public async Task<CustomResponseDto<bool>> ResendConfirmationEmailAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            if (user.EmailConfirmed)
                return CustomResponseDto<bool>.Fail(400, "Bu e-posta adresi zaten doğrulanmış.");

            // Mevcut OTP süresi dolmamışsa tekrar gönderimi engelle (spam koruması)
            if (user.OtpType == "email_confirm"
                && user.OtpExpiry.HasValue
                && user.OtpExpiry.Value > DateTime.UtcNow.AddMinutes(10))
            {
                return CustomResponseDto<bool>.Fail(429, "Kodu yeni gönderdik. Lütfen birkaç dakika bekleyip tekrar deneyin.");
            }

            await SendConfirmationEmailAsync(user);

            _logger.LogInformation("Doğrulama e-postası yeniden gönderildi. UserId: {UserId}", user.Id);
            return CustomResponseDto<bool>.Success(200, true);
        }

        // ─── Private helpers ───────────────────────────────────────────────────────

        private async Task SendConfirmationEmailAsync(AppUser user)
        {
            var rawToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(rawToken));
            var otp = Random.Shared.Next(100000, 1000000).ToString();

            // OTP'yi DB'ye yaz (restart-safe, multi-instance uyumlu)
            user.OtpCode = otp;
            user.OtpToken = encodedToken;
            user.OtpType = "email_confirm";
            user.OtpExpiry = DateTime.UtcNow.Add(OtpTtl);
            await _userManager.UpdateAsync(user);

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
