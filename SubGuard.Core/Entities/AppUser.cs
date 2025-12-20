using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Core.Entities
{
    // Standart IdentityUser'dan miras alıyoruz (Id, Email, PasswordHash vb. içinde hazır gelir)
    public class AppUser : IdentityUser
    {
        public string FullName { get; set; }
    }
}
