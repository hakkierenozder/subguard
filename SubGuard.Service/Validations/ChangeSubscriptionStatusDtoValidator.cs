using FluentValidation;
using SubGuard.Core.DTOs;
using SubGuard.Core.Enums;

namespace SubGuard.Service.Validations
{
    public class ChangeSubscriptionStatusDtoValidator : AbstractValidator<ChangeSubscriptionStatusDto>
    {
        public ChangeSubscriptionStatusDtoValidator()
        {
            RuleFor(x => x.Status)
                .IsInEnum().WithMessage("Geçersiz abonelik durumu. Kabul edilen değerler: Active, Paused, Cancelled.");
        }
    }
}
