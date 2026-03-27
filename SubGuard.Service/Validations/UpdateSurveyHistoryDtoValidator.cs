using FluentValidation;
using SubGuard.Core.DTOs;

namespace SubGuard.Service.Validations
{
    public class UpdateSurveyHistoryDtoValidator : AbstractValidator<UpdateSurveyHistoryDto>
    {
        public UpdateSurveyHistoryDtoValidator()
        {
            RuleFor(x => x.UsageHistoryJson)
                .NotNull().WithMessage("UsageHistoryJson boş gönderilemez.");
        }
    }
}
