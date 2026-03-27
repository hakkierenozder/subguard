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

        /// <summary>
        /// Tüm katalogları planlarıyla birlikte getirir (parametre verilmezse tümü).
        /// #38: Eskiden tümü RAM'e yüklenip servis katmanında sayfalanıyordu;
        /// artık Skip/Take DB tarafında uygulanır.
        /// </summary>
        Task<List<Catalog>> GetAllCatalogsWithPlansAsync();

        /// <summary>
        /// #38: DB-level pagination — büyük kataloglar için tercih edilir.
        /// </summary>
        Task<(List<Catalog> Items, int TotalCount)> GetPagedCatalogsWithPlansAsync(int page, int pageSize);

        /// <summary>
        /// Belirli ID'lere sahip katalogları planlarıyla birlikte getirir.
        /// GetTrendingAsync'te tüm katalog RAM'e yüklenmeden, sadece ilgili kayıtlar sorgulanır.
        /// </summary>
        Task<List<Catalog>> GetCatalogsByIdsAsync(List<int> ids);
    }
}
