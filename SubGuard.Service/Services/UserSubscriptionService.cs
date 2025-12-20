using AutoMapper;
using Microsoft.EntityFrameworkCore; // <-- BUNU MUTLAKA EKLE (Include ve ToListAsync için)
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
        private readonly IGenericRepository<Catalog> _catalogRepo; // <-- YENİ: Katalog Reposunu buraya ekledik
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        // Constructor'da catalogRepo'yu istiyoruz (Dependency Injection)
        public UserSubscriptionService(
            IGenericRepository<UserSubscription> repo,
            IGenericRepository<Catalog> catalogRepo, // <-- EKLENDİ
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _repo = repo;
            _catalogRepo = catalogRepo; // <-- ATANDI
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<CustomResponseDto<UserSubscriptionDto>> AddSubscriptionAsync(UserSubscriptionDto dto)
        {
            var entity = _mapper.Map<UserSubscription>(dto);

            // Renk ve Katalog kontrolü
            if (string.IsNullOrEmpty(entity.ColorCode) && entity.CatalogId.HasValue)
            {
                // Artık _unitOfWork üzerinden değil, direkt _catalogRepo üzerinden çekiyoruz
                var catalogItem = await _catalogRepo.GetByIdAsync(entity.CatalogId.Value);

                if (catalogItem != null)
                {
                    entity.ColorCode = catalogItem.ColorCode;
                }
            }

            // Varsayılan renk
            if (string.IsNullOrEmpty(entity.ColorCode))
            {
                entity.ColorCode = "#333333";
            }

            await _repo.AddAsync(entity);
            await _unitOfWork.CommitAsync();

            var newDto = _mapper.Map<UserSubscriptionDto>(entity);
            return CustomResponseDto<UserSubscriptionDto>.Success(200, newDto);
        }

        public async Task<CustomResponseDto<List<UserSubscriptionDto>>> GetUserSubscriptionsAsync(string userId)
        {
            // SENİN INTERFACE YAPINA UYGUN SORGULAMA:
            // _repo.Where IQueryable döner, üzerine Include ve ToListAsync ekleyebiliriz.
            var subscriptions = await _repo.Where(x => x.UserId == userId)
                                           .Include(x => x.Catalog) // Catalog tablosunu birleştir
                                           .ToListAsync();          // Veritabanına git ve çek

            var subscriptionDtos = _mapper.Map<List<UserSubscriptionDto>>(subscriptions);

            // --- RENK KURTARMA OPERASYONU ---
            foreach (var dto in subscriptionDtos)
            {
                if (string.IsNullOrEmpty(dto.ColorCode))
                {
                    var entity = subscriptions.FirstOrDefault(x => x.Id == dto.Id);

                    if (entity?.Catalog != null)
                    {
                        dto.ColorCode = entity.Catalog.ColorCode;
                    }
                    else
                    {
                        dto.ColorCode = "#333333";
                    }
                }
            }

            return CustomResponseDto<List<UserSubscriptionDto>>.Success(200, subscriptionDtos);
        }

        public async Task<CustomResponseDto<bool>> RemoveSubscriptionAsync(int id)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return CustomResponseDto<bool>.Fail(404, "Kayıt bulunamadı");

            _repo.Remove(entity);
            await _unitOfWork.CommitAsync();
            return CustomResponseDto<bool>.Success(204);
        }

        public async Task<CustomResponseDto<bool>> UpdateSubscriptionAsync(UserSubscriptionDto dto)
        {
            var entity = await _repo.GetByIdAsync(dto.Id);

            if (entity == null)
            {
                return CustomResponseDto<bool>.Fail(404, "Abonelik bulunamadı.");
            }

            _mapper.Map(dto, entity);

            _repo.Update(entity);
            await _unitOfWork.CommitAsync();

            return CustomResponseDto<bool>.Success(204);
        }
    }
}