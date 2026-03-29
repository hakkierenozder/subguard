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
            CreateMap<UserSubscription, UserSubscriptionDto>()
                .ForMember(dest => dest.SharedUserEmails,
                    opt => opt.MapFrom(src => src.Shares
                        .Where(s => !s.IsDeleted)
                        .Select(s => s.SharedUserEmail ?? s.SharedUserId)
                        .ToList()))
                // B-12: Frontend'in removeShare çağrısı yapabilmesi için userId'ler de döndürülür.
                // SharedUserIds ve SharedUserEmails aynı index sırasını korur.
                .ForMember(dest => dest.SharedUserIds,
                    opt => opt.MapFrom(src => src.Shares
                        .Where(s => !s.IsDeleted)
                        .Select(s => s.SharedUserId)
                        .ToList()))
                .ReverseMap()
                .ForMember(dest => dest.Shares, opt => opt.Ignore());
            CreateMap<UserSubscription, SharedWithMeItemDto>();
            CreateMap<AddUserSubscriptionDto, UserSubscription>();
            CreateMap<UpdateUserSubscriptionDto, UserSubscription>();
            CreateMap<NotificationQueue, NotificationDto>();
        }
    }
}
