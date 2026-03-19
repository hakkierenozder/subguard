using FluentValidation;
using SubGuard.Core.DTOs;

namespace SubGuard.Service.Validations
{
    public class RegisterPushTokenDtoValidator : AbstractValidator<RegisterPushTokenDto>
    {
        public RegisterPushTokenDtoValidator()
        {
            RuleFor(x => x.Token)
                .NotEmpty().WithMessage("Push token boş bırakılamaz.")
                .MaximumLength(512).WithMessage("Push token 512 karakterden uzun olamaz.")
                .Matches(@"^(ExponentPushToken|ExpoPushToken)\[[a-zA-Z0-9_\-]+\]$")
                .WithMessage("Geçersiz Expo push token formatı. Beklenen: ExponentPushToken[...] veya ExpoPushToken[...]");
        }
    }
}
