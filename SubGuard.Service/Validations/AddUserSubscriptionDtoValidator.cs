using FluentValidation;
using SubGuard.Core.Constants;
using SubGuard.Core.DTOs;
using SubGuard.Core.Enums;

namespace SubGuard.Service.Validations
{
    public class AddUserSubscriptionDtoValidator : AbstractValidator<AddUserSubscriptionDto>
    {
        public AddUserSubscriptionDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Abonelik adı boş bırakılamaz.")
                .MaximumLength(200).WithMessage("Abonelik adı en fazla 200 karakter olabilir.");

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Fiyat 0'dan büyük olmalıdır.");

            RuleFor(x => x.BillingDay)
                .InclusiveBetween(1, 31).WithMessage("Fatura günü 1 ile 31 arasında olmalıdır.");

            RuleFor(x => x.Currency)
                .NotEmpty().WithMessage("Para birimi seçilmelidir.")
                .Length(3).WithMessage("Para birimi kodu 3 karakter olmalıdır (ör: USD, TRY, EUR).")
                .Must(AppConstants.Currency.IsSupported)
                .WithMessage($"Desteklenen para birimleri: {string.Join(", ", AppConstants.Currency.SupportedCodes)}.");

            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("Kategori boş bırakılamaz.")
                .MaximumLength(100).WithMessage("Kategori adı en fazla 100 karakter olabilir.");

            RuleFor(x => x.FirstPaymentDate)
                .NotNull().WithMessage("İlk ödeme tarihi zorunludur.");

            RuleFor(x => x.BillingMonth)
                .NotNull().WithMessage("Yıllık aboneliklerde ödeme ayı zorunludur.")
                .InclusiveBetween(1, 12).WithMessage("Ödeme ayı 1 ile 12 arasında olmalıdır.")
                .When(x => x.BillingPeriod == BillingPeriod.Yearly);

            RuleFor(x => x.BillingMonth)
                .Null().WithMessage("Aylık aboneliklerde ödeme ayı gönderilmemelidir.")
                .When(x => x.BillingPeriod != BillingPeriod.Yearly);

            RuleFor(x => x.Notes)
                .MaximumLength(500).WithMessage("Not alanı en fazla 500 karakter olabilir.")
                .When(x => x.Notes != null);

            RuleForEach(x => x.SharedUserEmails)
                .EmailAddress().WithMessage("Paylaşılan kullanıcı e-postaları geçerli formatta olmalıdır.")
                .When(x => x.SharedUserEmails != null);

            RuleForEach(x => x.SharedGuestNames)
                .MaximumLength(100).WithMessage("Misafir adı en fazla 100 karakter olabilir.")
                .Must(name => !string.IsNullOrWhiteSpace(name)).WithMessage("Misafir adı boş olamaz.")
                .When(x => x.SharedGuestNames != null);

            RuleFor(x => x.ContractStartDate)
                .NotNull().WithMessage("Sözleşme başlangıç tarihi zorunludur.")
                .When(x => x.HasContract);

            RuleFor(x => x.ContractEndDate)
                .NotNull().WithMessage("Sözleşme bitiş tarihi zorunludur.")
                .When(x => x.HasContract);

            RuleFor(x => x.ContractStartDate)
                .GreaterThanOrEqualTo(x => x.FirstPaymentDate)
                .WithMessage("Taahhüt başlangıç tarihi, ilk ödeme tarihinden önce olamaz.")
                .When(x => x.HasContract && x.ContractStartDate.HasValue && x.FirstPaymentDate.HasValue);

            RuleFor(x => x.ContractEndDate)
                .GreaterThan(x => x.ContractStartDate)
                .WithMessage("Sözleşme bitiş tarihi, başlangıç tarihinden sonra olmalıdır.")
                .When(x => x.ContractStartDate.HasValue && x.ContractEndDate.HasValue);
        }
    }
}
