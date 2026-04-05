using FluentValidation;
using SubGuard.Core.Constants;
using SubGuard.Core.DTOs;

namespace SubGuard.Service.Validations
{
    public class BudgetSettingsDtoValidator : AbstractValidator<BudgetSettingsDto>
    {
        public BudgetSettingsDtoValidator()
        {
            RuleFor(x => x.MonthlyBudget)
                .GreaterThanOrEqualTo(0).When(x => x.MonthlyBudget.HasValue)
                .WithMessage("Aylık bütçe 0'dan küçük olamaz.");

            RuleFor(x => x.MonthlyBudgetCurrency)
                .NotEmpty().WithMessage("Para birimi boş bırakılamaz.")
                .Length(3).WithMessage("Para birimi 3 karakterli ISO kodu olmalıdır (ör: TRY, USD, EUR).")
                .Matches(@"^[A-Z]{3}$").WithMessage("Para birimi büyük harf ISO kodu olmalıdır (ör: TRY, USD, EUR).")
                .Must(AppConstants.Currency.IsSupported)
                .WithMessage($"Desteklenen para birimleri: {string.Join(", ", AppConstants.Currency.SupportedCodes)}.");
        }
    }
}
