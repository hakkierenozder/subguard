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
                .Must(url => Uri.TryCreate(url, UriKind.Absolute, out var result)
                             && (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps))
                .WithMessage("Logo URL geçerli bir HTTP/HTTPS adresi olmalıdır.")
                .When(x => !string.IsNullOrEmpty(x.LogoUrl));
        }
    }
}
