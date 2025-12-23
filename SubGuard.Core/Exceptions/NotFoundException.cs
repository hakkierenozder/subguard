using System;

namespace SubGuard.Core.Exceptions
{
    // Veri bulunamadığında fırlatılacak (Örn: Id=99 olan Subscription yok)
    // Bu hatalar 404 Not Found döner.
    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message)
        {
        }
    }
}