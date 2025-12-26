using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Core.UnitOfWork
{
    public interface IUnitOfWork
    {
        Task CommitAsync(); // SaveChangesAsync() tetikler.
        void Commit();      // SaveChanges() tetikler.

        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
