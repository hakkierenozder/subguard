using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SubGuard.Core.DTOs;

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomBaseController : ControllerBase
    {
        // Bu metod generic bir cevap döner. 
        // Response içindeki StatusCode 204 ise NoContent, 200 ise Ok döner.
        [NonAction] // Bu bir endpoint değildir.
        public IActionResult CreateActionResult<T>(CustomResponseDto<T> response)
        {
            if (response.StatusCode == 204)
                return new ObjectResult(null) { StatusCode = response.StatusCode };

            return new ObjectResult(response) { StatusCode = response.StatusCode };
        }
    }
}
