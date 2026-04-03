using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using SubGuard.Core.DTOs;
using SubGuard.Core.Services;
using System.Security.Claims;

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Sadece token'ı olanlar girebilir
    [EnableRateLimiting("user-api")]
    public class UserSubscriptionsController : CustomBaseController
    {
        private readonly IUserSubscriptionService _service;

        public UserSubscriptionsController(IUserSubscriptionService service)
        {
            _service = service;
        }

        // KOD TEKRARINI ÖNLEMEK İÇİN HELPER PROPERTY
        // Her seferinde User.FindFirst... yazmak yerine bunu kullanacağız.
        private string LoggedInUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

        [HttpGet]
        public async Task<IActionResult> GetMySubscriptions([FromQuery] PagedRequestDto paged, [FromQuery] string? q = null)
        {
            return CreateActionResult(await _service.GetUserSubscriptionsAsync(LoggedInUserId, paged.Page, paged.PageSize, q));
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] AddUserSubscriptionDto dto)
        {
            return CreateActionResult(await _service.AddSubscriptionAsync(dto, LoggedInUserId));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserSubscriptionDto dto)
        {
            try
            {
                return CreateActionResult(await _service.UpdateSubscriptionAsync(id, dto, LoggedInUserId));
            }
            catch (DbUpdateConcurrencyException)
            {
                // Aynı aboneliği aynı anda başka bir istek güncelledi (optimistic concurrency)
                return Conflict(new { errors = new[] { "Bu abonelik başka bir istek tarafından değiştirildi. Lütfen sayfayı yenileyip tekrar deneyin." } });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Remove(int id)
        {
            return CreateActionResult(await _service.RemoveSubscriptionAsync(id, LoggedInUserId));
        }

        // PATCH api/usersubscriptions/5/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeSubscriptionStatusDto dto)
        {
            return CreateActionResult(await _service.ChangeStatusAsync(id, LoggedInUserId, dto.Status, dto.ForceCancel));
        }

        // GET api/usersubscriptions/check-user?email=xxx
        // Paylaşım ekranında e-posta doğrulama için — sadece var/yok döner, kullanıcı detayı vermez
        [HttpGet("check-user")]
        public async Task<IActionResult> CheckUser([FromQuery] string email)
        {
            return CreateActionResult(await _service.CheckUserByEmailAsync(email));
        }

        // GET api/usersubscriptions/shared-with-me
        [HttpGet("shared-with-me")]
        public async Task<IActionResult> GetSharedWithMe([FromQuery] PagedRequestDto paged)
        {
            return CreateActionResult(await _service.GetSharedWithMeAsync(LoggedInUserId, paged.Page, paged.PageSize));
        }

        // POST api/usersubscriptions/5/share
        [HttpPost("{id}/share")]
        public async Task<IActionResult> Share(int id, [FromBody] ShareSubscriptionDto dto)
        {
            return CreateActionResult(await _service.ShareSubscriptionAsync(id, LoggedInUserId, dto.Email));
        }

        // DELETE api/usersubscriptions/5/share/userId123
        [HttpDelete("{id}/share/{targetUserId}")]
        public async Task<IActionResult> RemoveShare(int id, string targetUserId)
        {
            return CreateActionResult(await _service.RemoveShareAsync(id, LoggedInUserId, targetUserId));
        }

        // POST api/usersubscriptions/5/share/guest
        [HttpPost("{id}/share/guest")]
        public async Task<IActionResult> ShareGuest(int id, [FromBody] ShareGuestDto dto)
        {
            return CreateActionResult(await _service.ShareGuestAsync(id, LoggedInUserId, dto.DisplayName));
        }

        // DELETE api/usersubscriptions/5/share/guest/42
        [HttpDelete("{id}/share/guest/{shareId:int}")]
        public async Task<IActionResult> RemoveGuestShare(int id, int shareId)
        {
            return CreateActionResult(await _service.RemoveGuestShareAsync(id, LoggedInUserId, shareId));
        }

        // GET api/usersubscriptions/5/usage
        [HttpGet("{id}/usage")]
        public async Task<IActionResult> GetUsageHistory(int id)
        {
            return CreateActionResult(await _service.GetUsageHistoryAsync(id, LoggedInUserId));
        }

        // POST api/usersubscriptions/5/usage
        [HttpPost("{id}/usage")]
        public async Task<IActionResult> AddUsageLog(int id, [FromBody] AddUsageLogDto dto)
        {
            return CreateActionResult(await _service.AddUsageLogAsync(id, LoggedInUserId, dto));
        }

        // DELETE api/usersubscriptions/5/usage/a1b2c3d4
        [HttpDelete("{id}/usage/{logId}")]
        public async Task<IActionResult> DeleteUsageLog(int id, string logId)
        {
            return CreateActionResult(await _service.DeleteUsageLogAsync(id, LoggedInUserId, logId));
        }

        // POST api/usersubscriptions/5/duplicate
        [HttpPost("{id}/duplicate")]
        public async Task<IActionResult> Duplicate(int id)
        {
            return CreateActionResult(await _service.DuplicateSubscriptionAsync(id, LoggedInUserId));
        }

        // GET api/usersubscriptions/5/price-history
        [HttpGet("{id}/price-history")]
        public async Task<IActionResult> GetPriceHistory(int id)
        {
            return CreateActionResult(await _service.GetPriceHistoryAsync(id, LoggedInUserId));
        }

        // PATCH api/usersubscriptions/5/survey
        // Yalnızca UsageHistoryJson (anket geçmişi) günceller — PUT'tan ayrı tutuldu
        // çünkü PUT tüm abonelik alanlarını gerektirir; kısmi güncellemeye izin vermez.
        [HttpPatch("{id}/survey")]
        public async Task<IActionResult> UpdateSurveyHistory(int id, [FromBody] UpdateSurveyHistoryDto dto)
        {
            return CreateActionResult(await _service.UpdateSurveyHistoryAsync(id, LoggedInUserId, dto.UsageHistoryJson));
        }
    }
}