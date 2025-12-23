using Microsoft.AspNetCore.Mvc;
using SubGuard.Core.DTOs;

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomBaseController : ControllerBase
    {
        // Bu metod, Service katmanından gelen CustomResponseDto'yu 
        // HTTP Status Code'a (200, 201, 404, 400 vb.) çevirir.
        [NonAction] // Endpoint olmadığı için işaretliyoruz
        public IActionResult CreateActionResult<T>(CustomResponseDto<T> response)
        {
            if (response.StatusCode == 204)
                return new ObjectResult(null) { StatusCode = response.StatusCode };

            return new ObjectResult(response) { StatusCode = response.StatusCode };
        }
    }
}