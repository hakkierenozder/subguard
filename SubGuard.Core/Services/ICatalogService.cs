using SubGuard.Core.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Core.Services
{
    public interface ICatalogService
    {
        // API Controller bu metodu çağıracak.
        Task<CustomResponseDto<List<ServiceDto>>> GetAllCatalogsWithPlansAsync();

        Task<CustomResponseDto<ServiceDto>> GetCatalogByIdAsync(int id);
    }
}
