namespace SubGuard.Core.DTOs.Auth
{
    public class ResendConfirmationDto
    {
        /// <summary>
        /// UserId yerine e-posta alınır — kullanıcı ID numaralandırma saldırısını önler.
        /// </summary>
        public string Email { get; set; } = default!;
    }
}
