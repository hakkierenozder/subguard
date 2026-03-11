using Microsoft.EntityFrameworkCore;
using SubGuard.Core.Entities;
using SubGuard.Core.Repositories;
using SubGuard.Core.Specifications;
using SubGuard.Data.Specifications;
using System.Linq.Expressions;

namespace SubGuard.Data.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly AppDbContext _context;
        private readonly DbSet<T> _dbSet;

        public GenericRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);

        public async Task AddRangeAsync(IEnumerable<T> entities) => await _dbSet.AddRangeAsync(entities);

        public async Task<bool> AnyAsync(Expression<Func<T, bool>> expression) => await _dbSet.AnyAsync(expression);

        public IQueryable<T> GetAll() => _dbSet.AsNoTracking().AsQueryable();

        public async Task<T> GetByIdAsync(int id) => await _dbSet.FindAsync(id);

        public IQueryable<T> Where(Expression<Func<T, bool>> expression) => _dbSet.Where(expression);

        public IQueryable<T> ApplySpecification(ISpecification<T> spec)
            => SpecificationEvaluator<T>.GetQuery(_dbSet.AsQueryable(), spec);

        public void Remove(T entity)
        {
            if (entity is BaseEntity baseEntity)
            {
                baseEntity.IsDeleted = true;
                baseEntity.UpdatedDate = DateTime.UtcNow;
                _dbSet.Update(entity);
            }
            else
            {
                _dbSet.Remove(entity);
            }
        }

        public void RemoveRange(IEnumerable<T> entities)
        {
            foreach (var entity in entities)
                Remove(entity);
        }

        public void Update(T entity) => _dbSet.Update(entity);
    }
}
