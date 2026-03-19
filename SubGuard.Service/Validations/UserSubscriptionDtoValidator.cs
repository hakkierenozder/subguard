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
                .GreaterThan(0).WithMessage("Fiyat 0'dan büyük olmalıdır.");

            // Fatura günü ayın 1'i ile 31'i arasında olmalı
            RuleFor(x => x.BillingDay)
                .InclusiveBetween(1, 31).WithMessage("Fatura günü 1 ile 31 arasında olmalıdır.");

            RuleFor(x => x.Currency)
                .NotEmpty().WithMessage("Para birimi seçilmelidir.")
                .Length(3).WithMessage("Para birimi kodu 3 karakter olmalıdır (ör: USD, TRY, EUR).");

            RuleFor(x => x.Notes)
                .MaximumLength(500).WithMessage("Not alanı en fazla 500 karakter olabilir.")
                .When(x => x.Notes != null);

            // Kontrat tarihleri girilmişse başlangıç < bitiş olmalı
            RuleFor(x => x.ContractEndDate)
                .GreaterThan(x => x.ContractStartDate)
                .WithMessage("Sözleşme bitiş tarihi, başlangıç tarihinden sonra olmalıdır.")
                .When(x => x.ContractStartDate.HasValue && x.ContractEndDate.HasValue);
        }
    }
}