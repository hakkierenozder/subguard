using FluentValidation;
using SubGuard.Core.DTOs;

namespace SubGuard.Service.Validations
{
    public class ServiceDtoValidator : AbstractValidator<ServiceDto>
    {
        public ServiceDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Servis adı boş bırakılamaz.")
                .MaximumLength(100).WithMessage("Servis adı 100 karakterden uzun olamaz.");

            RuleFor(x => x.ColorCode)
                .Matches(@"^#[0-9A-Fa-f]{6}$")
                .WithMessage("Renk kodu #RRGGBB formatında olmalıdır (ör: #FF5733).")
                .When(x => !string.IsNullOrEmpty(x.ColorCode));

            RuleFor(x => x.LogoUrl)
                .MaximumLength(500).WithMessage("LogoUrl en fazla 500 karakter olabilir.")
                .Must(url => string.IsNullOrEmpty(url) || Uri.TryCreate(url, UriKind.Absolute, out _))
                .WithMessage("LogoUrl geçerli bir URL olmalıdır.")
                .When(x => x.LogoUrl != null);
        }
    }
}
