using System.Linq.Expressions;

namespace SubGuard.Core.Specifications
{
    /// <summary>
    /// Repository sorgularını kapsülleyen Specification pattern kontratı.
    /// Filtre, include, sıralama ve sayfalama bir arada tanımlanır.
    /// </summary>
    public interface ISpecification<T>
    {
        /// <summary>WHERE koşulu. null ise filtre uygulanmaz.</summary>
        Expression<Func<T, bool>>? Criteria { get; }

        /// <summary>Eager-load edilecek navigation property'ler.</summary>
        List<Expression<Func<T, object>>> Includes { get; }

        /// <summary>Artan sıralama ifadesi.</summary>
        Expression<Func<T, object>>? OrderBy { get; }

        /// <summary>Azalan sıralama ifadesi.</summary>
        Expression<Func<T, object>>? OrderByDescending { get; }

        int? Take { get; }
        int? Skip { get; }
        bool IsPagingEnabled { get; }
    }
}
