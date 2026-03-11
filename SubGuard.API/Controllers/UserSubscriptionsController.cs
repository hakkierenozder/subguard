using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SubGuard.Core.DTOs;
using SubGuard.Core.Services;
using System.Security.Claims;

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Sadece token'ı olanlar girebilir
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
        public async Task<IActionResult> GetMySubscriptions([FromQuery] PagedRequestDto paged)
        {
            return CreateActionResult(await _service.GetUserSubscriptionsAsync(LoggedInUserId, paged.Page, paged.PageSize));
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] UserSubscriptionDto dto)
        {
            // GÜVENLİK: Body'den gelen UserId'yi ez ve Token'dan gelen gerçek ID'yi bas.
            // Böylece kullanıcı başkası adına kayıt atamaz.
            dto.UserId = LoggedInUserId;

            return CreateActionResult(await _service.AddSubscriptionAsync(dto));
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UserSubscriptionDto dto)
        {
            // GÜVENLİK: Güncelleme yaparken de aboneliğin sahibini Token'daki kişi yapıyoruz.
            dto.UserId = LoggedInUserId;

            // Service katmanı, bu ID'li kayıt veritabanında var mı ve sahibi bu kişi mi diye kontrol etmeli.
            return CreateActionResult(await _service.UpdateSubscriptionAsync(dto));
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
            return CreateActionResult(await _service.ChangeStatusAsync(id, LoggedInUserId, dto.Status));
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
    }
}