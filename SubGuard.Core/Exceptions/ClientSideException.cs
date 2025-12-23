using System;

namespace SubGuard.Core.Exceptions
{
    // Kullanıcının hatalı veri girmesi durumunda fırlatılacak (Örn: Şifre kısa, Email formatı yanlış)
    // Bu hatalar 400 Bad Request döner.
    public class ClientSideException : Exception
    {
        public ClientSideException(string message) : base(message)
        {
        }
    }
}