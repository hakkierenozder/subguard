using FluentValidation;
using SubGuard.Core.DTOs;

namespace SubGuard.Service.Validations
{
    public class ShareSubscriptionDtoValidator : AbstractValidator<ShareSubscriptionDto>
    {
        public ShareSubscriptionDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("E-posta adresi boş bırakılamaz.")
                .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.")
                .MaximumLength(256).WithMessage("E-posta adresi 256 karakterden uzun olamaz.");
        }
    }
}
