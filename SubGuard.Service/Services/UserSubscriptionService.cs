using AutoMapper;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;
using SubGuard.Core.UnitOfWork;

namespace SubGuard.Service.Services
{
    public class UserSubscriptionService : IUserSubscriptionService
    {
        private readonly IGenericRepository<UserSubscription> _repo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserSubscriptionService(IGenericRepository<UserSubscription> repo, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _repo = repo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<CustomResponseDto<UserSubscriptionDto>> AddSubscriptionAsync(UserSubscriptionDto dto)
        {
            var entity = _mapper.Map<UserSubscription>(dto);
            await _repo.AddAsync(entity);
            await _unitOfWork.CommitAsync();

            var newDto = _mapper.Map<UserSubscriptionDto>(entity);
            return CustomResponseDto<UserSubscriptionDto>.Success(200, newDto);
        }

        public async Task<CustomResponseDto<List<UserSubscriptionDto>>> GetUserSubscriptionsAsync(string userId)
        {
            // Where sorgusu
            var list = _repo.Where(x => x.UserId == userId);
            // Burada ToListAsync lazım olabilir ama IQueryable döndüğü için service katmanında materialization yapalım
            // Not: GenericRepo IQueryable dönüyor.

            var dtoList = _mapper.Map<List<UserSubscriptionDto>>(list.ToList());
            return CustomResponseDto<List<UserSubscriptionDto>>.Success(200, dtoList);
        }

        public async Task<CustomResponseDto<bool>> RemoveSubscriptionAsync(int id)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return CustomResponseDto<bool>.Fail(404, "Kayıt bulunamadı");

            _repo.Remove(entity);
            await _unitOfWork.CommitAsync();
            return CustomResponseDto<bool>.Success(204);
        }
    }
}