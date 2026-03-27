using Hangfire.Dashboard;
using Microsoft.AspNetCore.Identity;
using SubGuard.Core.Entities;
using System.Security.Claims;

namespace SubGuard.API.Middlewares
{
    /// <summary>
    /// Hangfire Dashboard'a erişimi yalnızca kimliği doğrulanmış Admin rolündeki
    /// kullanıcılarla kısıtlar. LocalRequestsOnlyAuthorizationFilter'ın yetersiz
    /// kaldığı reverse proxy senaryolarında (nginx, caddy vb.) güvenli çalışır.
    /// </summary>
    public class HangfireAdminAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            var httpContext = context.GetHttpContext();

            // Kullanıcı giriş yapmamışsa reddet
            if (httpContext.User?.Identity?.IsAuthenticated != true)
                return false;

            // "Admin" rolü yoksa reddet
            return httpContext.User.IsInRole("Admin");
        }
    }
}
