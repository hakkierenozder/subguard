using AutoMapper;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;

namespace SubGuard.Service.Mapping
{
    public class MapProfile : Profile
    {
        public MapProfile()
        {
            // ReverseMap: Hem Entity -> DTO hem de DTO -> Entity dönüşümünü açar.
            CreateMap<Catalog, ServiceDto>().ReverseMap();
            CreateMap<Plan, PlanDto>().ReverseMap();
        }
    }
}
