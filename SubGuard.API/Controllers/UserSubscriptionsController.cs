using Microsoft.AspNetCore.Authorization; // EKLE
using Microsoft.AspNetCore.Mvc;
using SubGuard.Core.DTOs;
using SubGuard.Core.Services;
using System.Security.Claims; // EKLE

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // <-- ARTIK SADECE GİRİŞ YAPANLAR GİREBİLİR
    public class UserSubscriptionsController : CustomBaseController
    {
        private readonly IUserSubscriptionService _service;

        public UserSubscriptionsController(IUserSubscriptionService service)
        {
            _service = service;
        }

        // ESKİSİ: [HttpGet("{userId}")]
        // YENİSİ: Parametre yok, Token'dan okur
        [HttpGet]
        public async Task<IActionResult> GetMySubscriptions()
        {
            // Token içindeki "nameid" (UserId) claim'ini oku
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return CreateActionResult(await _service.GetUserSubscriptionsAsync(userId));
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] UserSubscriptionDto dto)
        {
            // Güvenlik: Kullanıcı başkasının adına kayıt atamasın, ID'yi token'dan bas.
            dto.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return CreateActionResult(await _service.AddSubscriptionAsync(dto));
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UserSubscriptionDto dto)
        {
            dto.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return CreateActionResult(await _service.UpdateSubscriptionAsync(dto));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            // İleride buraya "Sadece kendi kaydını silebilirsin" kontrolü de eklenebilir.
            return CreateActionResult(await _service.RemoveSubscriptionAsync(id));
        }
    }
}