using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SubGuard.Core.DTOs;
using SubGuard.Core.Services;
using System.Security.Claims;

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : CustomBaseController
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private string LoggedInUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // GET api/notifications?page=1&pageSize=10
        [HttpGet]
        public async Task<IActionResult> GetMyNotifications([FromQuery] PagedRequestDto paged)
        {
            return CreateActionResult(await _notificationService.GetUserNotificationsAsync(LoggedInUserId, paged.Page, paged.PageSize));
        }

        // PUT api/notifications/5/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            return CreateActionResult(await _notificationService.MarkAsReadAsync(id, LoggedInUserId));
        }

        // DELETE api/notifications/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return CreateActionResult(await _notificationService.DeleteNotificationAsync(id, LoggedInUserId));
        }

        // PUT api/notifications/push-token
        [HttpPut("push-token")]
        public async Task<IActionResult> RegisterPushToken([FromBody] RegisterPushTokenDto dto)
        {
            return CreateActionResult(await _notificationService.RegisterPushTokenAsync(LoggedInUserId, dto.Token));
        }
    }
}
