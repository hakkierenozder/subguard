using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Core.Entities
{
    // Katalogdaki Ana Firmalar (Netflix, Turkcell vb.)
    public class Catalog : BaseEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? LogoUrl { get; set; }
        public string? ColorCode { get; set; }
        public string Category { get; set; }
        public bool RequiresContract { get; set; }

        // Bir kataloğun birden fazla planı olabilir
        public ICollection<Plan> Plans { get; set; }
    }
}
