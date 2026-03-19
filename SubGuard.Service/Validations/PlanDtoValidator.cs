using FluentValidation;
using SubGuard.Core.DTOs;

namespace SubGuard.Service.Validations
{
    public class PlanDtoValidator : AbstractValidator<PlanDto>
    {
        public PlanDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Plan adı boş bırakılamaz.")
                .MaximumLength(100).WithMessage("Plan adı 100 karakterden uzun olamaz.");

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Plan fiyatı 0'dan büyük olmalıdır.");

            RuleFor(x => x.BillingCycleDays)
                .GreaterThan(0).WithMessage("Fatura döngüsü en az 1 gün olmalıdır.");

            RuleFor(x => x.Currency)
                .NotEmpty().WithMessage("Para birimi seçilmelidir.")
                .Length(3).WithMessage("Para birimi kodu 3 karakter olmalıdır (ör: USD, TRY, EUR).");
        }
    }
}
