using System.ComponentModel.DataAnnotations;

namespace SubGuard.Core.DTOs.Admin
{
    public class AssignRoleDto
    {
        [Required(ErrorMessage = "E-posta adresi boş bırakılamaz.")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
        [MaxLength(256)]
        public string Email { get; set; }
    }
}
