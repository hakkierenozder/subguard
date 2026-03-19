using FluentValidation;
using SubGuard.Core.DTOs;

namespace SubGuard.Service.Validations
{
    public class AddUsageLogDtoValidator : AbstractValidator<AddUsageLogDto>
    {
        public AddUsageLogDtoValidator()
        {
            RuleFor(x => x.Note)
                .MaximumLength(500).WithMessage("Not 500 karakterden uzun olamaz.")
                .When(x => x.Note != null);

            RuleFor(x => x.Amount)
                .GreaterThanOrEqualTo(0).WithMessage("Kullanım miktarı 0 veya daha büyük olmalıdır.")
                .When(x => x.Amount.HasValue);

            RuleFor(x => x.Unit)
                .MaximumLength(50).WithMessage("Birim 50 karakterden uzun olamaz.")
                .When(x => x.Unit != null);

            // Amount girilmişse Unit de girilmeli
            RuleFor(x => x.Unit)
                .NotEmpty().WithMessage("Miktar girildiğinde birim de belirtilmelidir.")
                .When(x => x.Amount.HasValue);
        }
    }
}
