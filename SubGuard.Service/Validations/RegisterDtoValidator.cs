using FluentValidation;
using SubGuard.Core.DTOs.Auth;

namespace SubGuard.Service.Validations
{
    public class RegisterDtoValidator : AbstractValidator<RegisterDto>
    {
        public RegisterDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("E-posta adresi gereklidir.")
                .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Şifre gereklidir.")
                .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır."); // Program.cs ayarına uygun

            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Ad Soyad gereklidir.");
        }
    }
}