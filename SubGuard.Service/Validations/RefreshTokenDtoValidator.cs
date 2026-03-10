using FluentValidation;
using SubGuard.Core.DTOs.Auth;

namespace SubGuard.Service.Validations
{
    public class RefreshTokenDtoValidator : AbstractValidator<RefreshTokenDto>
    {
        public RefreshTokenDtoValidator()
        {
            RuleFor(x => x.Token)
                .NotEmpty().WithMessage("Refresh token gereklidir.");
        }
    }
}
