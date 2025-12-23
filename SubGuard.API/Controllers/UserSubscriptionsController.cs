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
        public async Task<IActionResult> GetMySubscriptions()
        {
            // Serviste bu metot yoksa, IService'e "GetAllByUserIdAsync" eklememiz gerekecek.
            // Şimdilik servisin bu yeteneği olduğunu varsayıyoruz.
            return CreateActionResult(await _service.GetUserSubscriptionsAsync(LoggedInUserId));
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
            // GÜVENLİK UYARISI: 
            // Generic Remove(id) kullanırsak, başkasının aboneliğini silebiliriz.
            // Service katmanında "RemoveSubscriptionOfUser(int id, string userId)" gibi bir metot olmalı.
            // Şimdilik mevcut yapıyı koruyarak ID gönderiyoruz ama Service tarafında kontrol şart.

            return CreateActionResult(await _service.RemoveSubscriptionAsync(id));
        }
    }
}