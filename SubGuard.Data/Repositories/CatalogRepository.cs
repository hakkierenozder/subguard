using Microsoft.EntityFrameworkCore;
using SubGuard.Core.Entities;
using SubGuard.Core.Repositories;

namespace SabGuard.Data.Repositories
{
    public class CatalogRepository : GenericRepository<Catalog>, ICatalogRepository
    {
        public CatalogRepository(AppDbContext context) : base(context)
        {
        }

        // Servisleri getirirken Planlarını da JOIN yapıp getiriyoruz (Eager Loading)
        public async Task<List<Catalog>> GetAllCatalogsWithPlansAsync()
        {
            return await _context.Catalogs.Include(x => x.Plans).ToListAsync();
        }

        public async Task<Catalog> GetCatalogWithPlansAsync(int id)
        {
            return await _context.Catalogs.Include(x => x.Plans).FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
