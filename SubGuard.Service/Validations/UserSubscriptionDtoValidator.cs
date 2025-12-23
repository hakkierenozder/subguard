using FluentValidation;
using SubGuard.Core.DTOs;

namespace SubGuard.Service.Validations
{
    public class UserSubscriptionDtoValidator : AbstractValidator<UserSubscriptionDto>
    {
        public UserSubscriptionDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Abonelik adı (Name) boş bırakılamaz.");

            RuleFor(x => x.Price)
                .GreaterThanOrEqualTo(0).WithMessage("Fiyat 0'dan küçük olamaz.");

            // Fatura günü ayın 1'i ile 31'i arasında olmalı
            RuleFor(x => x.BillingDay)
                .InclusiveBetween(1, 31).WithMessage("Fatura günü 1 ile 31 arasında olmalıdır.");

            RuleFor(x => x.Currency)
                .NotEmpty().WithMessage("Para birimi seçilmelidir.")
                .Length(1, 5).WithMessage("Geçersiz para birimi kodu.");
        }
    }
}