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
                        .Where(s => !s.IsDeleted && s.SharedUserId != null)
                        .Select(s => s.SharedUserEmail ?? s.SharedUserId)
                        .ToList()))
                .ForMember(dest => dest.SharedUserIds,
                    opt => opt.MapFrom(src => src.Shares
                        .Where(s => !s.IsDeleted && s.SharedUserId != null)
                        .Select(s => s.SharedUserId)
                        .ToList()))
                .ForMember(dest => dest.SharedGuests,
                    opt => opt.MapFrom(src => src.Shares
                        .Where(s => !s.IsDeleted && s.SharedUserId == null)
                        .Select(s => new GuestShareItemDto { Id = s.Id, DisplayName = s.DisplayName ?? "" })
                        .ToList()))
                .ReverseMap()
                .ForMember(dest => dest.Shares, opt => opt.Ignore());
            CreateMap<UserSubscription, SharedWithMeItemDto>()
                .IncludeBase<UserSubscription, UserSubscriptionDto>();
            CreateMap<AddUserSubscriptionDto, UserSubscription>();
            CreateMap<UpdateUserSubscriptionDto, UserSubscription>();
            CreateMap<NotificationQueue, NotificationDto>();
        }
    }
}
