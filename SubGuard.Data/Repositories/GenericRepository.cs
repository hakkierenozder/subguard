using Microsoft.EntityFrameworkCore;
using SubGuard.Core.Entities; // BaseEntity'i tanıması için gerekli
using SubGuard.Core.Repositories;
using System.Linq.Expressions;

namespace SubGuard.Data.Repositories // Namespace'i orijinal dosyadaki gibi koruyorum (SabGuard yazılmış, SubGuard olmalı ama dosyada SabGuard ise düzeltiyorum)
{
    // Not: Orijinal dosyada namespace 'SabGuard' olarak görünüyor, proje genelinde 'SubGuard' kullanılıyor. 
    // Tutarlılık için SubGuard olarak düzeltilmesi önerilir ancak mevcut yapıyı bozmamak adına dosya içeriğine sadık kalarak mantığı uyguluyorum.

    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly AppDbContext _context;
        private readonly DbSet<T> _dbSet;

        public GenericRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public async Task AddRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }

        public async Task<bool> AnyAsync(Expression<Func<T, bool>> expression)
        {
            return await _dbSet.AnyAsync(expression);
        }

        public IQueryable<T> GetAll()
        {
            return _dbSet.AsNoTracking().AsQueryable();
        }

        public async Task<T> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        // --- SOFT DELETE IMPLEMENTATION START ---
        public void Remove(T entity)
        {
            // Eğer entity BaseEntity'den türetilmişse Soft Delete yap
            if (entity is BaseEntity baseEntity)
            {
                baseEntity.IsDeleted = true;
                baseEntity.UpdatedDate = DateTime.UtcNow; // Silinme anını güncelleme tarihi olarak işleyelim
                _dbSet.Update(entity);
            }
            else
            {
                // BaseEntity değilse (örneğin çoka-çok ilişki tablosu vb.) normal sil
                _dbSet.Remove(entity);
            }
        }

        public void RemoveRange(IEnumerable<T> entities)
        {
            foreach (var entity in entities)
            {
                Remove(entity); // Yukarıdaki mantığı her biri için uygula
            }
        }
        // --- SOFT DELETE IMPLEMENTATION END ---

        public void Update(T entity)
        {
            _dbSet.Update(entity);
        }

        public IQueryable<T> Where(Expression<Func<T, bool>> expression)
        {
            return _dbSet.Where(expression);
        }
    }
}