using SubGuard.Core.Specifications;
using System.Linq.Expressions;

namespace SubGuard.Core.Repositories
{
    public interface IGenericRepository<T> where T : class
    {
        Task<T> GetByIdAsync(int id);

        IQueryable<T> GetAll();

        IQueryable<T> Where(Expression<Func<T, bool>> expression);
        Task<bool> AnyAsync(Expression<Func<T, bool>> expression);

        /// <summary>
        /// Specification pattern: filtre, include, siralama ve sayfalama ifadelerini
        /// tek bir spec nesnesiyle uygulayarak IQueryable doner.
        /// </summary>
        IQueryable<T> ApplySpecification(ISpecification<T> spec);

        Task AddAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);

        void Update(T entity);
        void Remove(T entity);
        void RemoveRange(IEnumerable<T> entities);
    }
}
