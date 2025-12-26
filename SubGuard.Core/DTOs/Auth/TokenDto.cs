using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Core.DTOs.Auth
{
    public class TokenDto
    {
        public string AccessToken { get; set; }
        public DateTime AccessTokenExpiration { get; set; } // Expiration adını netleştirdik
        public string RefreshToken { get; set; } // Yeni
        public DateTime RefreshTokenExpiration { get; set; } // Yeni
        public string UserId { get; set; }
        public string FullName { get; set; }
    }
}
