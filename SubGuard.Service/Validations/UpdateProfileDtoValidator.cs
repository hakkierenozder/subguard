using FluentValidation;
using SubGuard.Core.DTOs.Auth;

namespace SubGuard.Service.Validations
{
    public class UpdateProfileDtoValidator : AbstractValidator<UpdateProfileDto>
    {
        public UpdateProfileDtoValidator()
        {
            RuleFor(x => x.FullName)
                .MaximumLength(100).WithMessage("Ad Soyad en fazla 100 karakter olabilir.")
                .When(x => x.FullName != null);

            RuleFor(x => x.MonthlyBudget)
                .GreaterThanOrEqualTo(0).WithMessage("Aylık bütçe 0'dan küçük olamaz.")
                .When(x => x.MonthlyBudget.HasValue);

            RuleFor(x => x.BudgetAlertThreshold)
                .InclusiveBetween(0, 100).WithMessage("Bütçe uyarı eşiği 0 ile 100 arasında olmalıdır.")
                .When(x => x.BudgetAlertThreshold.HasValue);
        }
    }
}
