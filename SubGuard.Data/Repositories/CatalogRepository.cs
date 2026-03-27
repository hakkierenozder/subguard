using Microsoft.EntityFrameworkCore;
using SubGuard.Core.Entities;
using SubGuard.Core.Repositories;
using SubGuard.Data.Repositories;

namespace SubGuard.Data.Repositories
{
    public class CatalogRepository : GenericRepository<Catalog>, ICatalogRepository
    {
        public CatalogRepository(AppDbContext context) : base(context)
        {
        }

        // Servisleri getirirken Planlarını da JOIN yapıp getiriyoruz (Eager Loading)
        // CachedCatalogService tarafından "tüm katalogları önbelleğe al" akışında kullanılır.
        public async Task<List<Catalog>> GetAllCatalogsWithPlansAsync()
        {
            return await _context.Catalogs.Include(x => x.Plans).OrderBy(x => x.Id).ToListAsync();
        }

        // #38: DB-level pagination — Skip/Take veritabanında çalışır, RAM'e yüklemez.
        public async Task<(List<Catalog> Items, int TotalCount)> GetPagedCatalogsWithPlansAsync(int page, int pageSize)
        {
            var query = _context.Catalogs.Include(x => x.Plans).OrderBy(x => x.Id);
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return (items, totalCount);
        }

        public async Task<Catalog> GetCatalogWithPlansAsync(int id)
        {
            return await _context.Catalogs.Include(x => x.Plans).FirstOrDefaultAsync(x => x.Id == id);
        }

        /// <summary>
        /// Sadece belirtilen ID'leri sorgular — GetTrendingAsync'te tüm tabloyu RAM'e yüklemekten kaçınır.
        /// </summary>
        public async Task<List<Catalog>> GetCatalogsByIdsAsync(List<int> ids)
        {
            return await _context.Catalogs
                .Where(c => ids.Contains(c.Id))
                .Include(c => c.Plans)
                .ToListAsync();
        }
    }
}
