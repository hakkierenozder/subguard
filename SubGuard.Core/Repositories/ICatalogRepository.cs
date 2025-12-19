using SubGuard.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Core.Repositories
{
    public interface ICatalogRepository : IGenericRepository<Catalog>
    {
        // Standart dışı, özel sorgu:
        // Servisi çekerken altındaki Planları da (Join yaparak) tek seferde getir.
        Task<Catalog> GetCatalogWithPlansAsync(int id);
        Task<List<Catalog>> GetAllCatalogsWithPlansAsync();
    }
}
