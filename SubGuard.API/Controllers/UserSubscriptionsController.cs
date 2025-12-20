using Microsoft.AspNetCore.Mvc;
using SubGuard.Core.DTOs;
using SubGuard.Core.Services;

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserSubscriptionsController : CustomBaseController
    {
        private readonly IUserSubscriptionService _service;

        public UserSubscriptionsController(IUserSubscriptionService service)
        {
            _service = service;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetByUserId(string userId)
        {
            return CreateActionResult(await _service.GetUserSubscriptionsAsync(userId));
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] UserSubscriptionDto dto)
        {
            return CreateActionResult(await _service.AddSubscriptionAsync(dto));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return CreateActionResult(await _service.RemoveSubscriptionAsync(id));
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UserSubscriptionDto dto)
        {
            return CreateActionResult(await _service.UpdateSubscriptionAsync(dto));
        }
    }
}