using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SubGuard.Core.DTOs;
using SubGuard.Core.Services;
using System.Security.Claims;
// NotificationPreferencesDto ve RegisterPushTokenDto → SubGuard.Core.DTOs namespace'inde

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    [EnableRateLimiting("user-api")]
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

        // PUT api/notifications/read-all  (alias: mark-all-read)
        [HttpPut("read-all")]
        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            return CreateActionResult(await _notificationService.MarkAllAsReadAsync(LoggedInUserId));
        }

        // GET api/notifications/preferences
        [HttpGet("preferences")]
        public async Task<IActionResult> GetPreferences()
        {
            return CreateActionResult(await _notificationService.GetPreferencesAsync(LoggedInUserId));
        }

        // PUT api/notifications/preferences  (#33: idempotent güncelleme → POST → PUT)
        [HttpPut("preferences")]
        public async Task<IActionResult> UpdatePreferences([FromBody] NotificationPreferencesDto dto)
        {
            return CreateActionResult(await _notificationService.UpdatePreferencesAsync(LoggedInUserId, dto));
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

        // POST api/notifications/send-reminder/5
        [HttpPost("send-reminder/{subscriptionId:int}")]
        public async Task<IActionResult> SendReminder(int subscriptionId)
        {
            return CreateActionResult(await _notificationService.SendManualReminderAsync(subscriptionId, LoggedInUserId));
        }
    }
}
