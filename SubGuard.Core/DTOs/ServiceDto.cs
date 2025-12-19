using SubGuard.Core.DTOs.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Core.DTOs
{
    public class ServiceDto : BaseDto // Id ve CreatedDate ortak olabilir
    {
        public string Name { get; set; }
        public string LogoUrl { get; set; }
        public string ColorCode { get; set; }
        public string Category { get; set; }
        public bool RequiresContract { get; set; }

        // İlişkili veri: Planları da taşıyacak mı? Evet.
        public List<PlanDto> Plans { get; set; }
    }
}
