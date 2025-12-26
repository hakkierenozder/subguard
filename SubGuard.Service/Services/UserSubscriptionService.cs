using AutoMapper;
using Microsoft.EntityFrameworkCore;
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
        private readonly IGenericRepository<Catalog> _catalogRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserSubscriptionService(
            IGenericRepository<UserSubscription> repo,
            IGenericRepository<Catalog> catalogRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _repo = repo;
            _catalogRepo = catalogRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<CustomResponseDto<UserSubscriptionDto>> AddSubscriptionAsync(UserSubscriptionDto dto)
        {
            // Transaction Başlat
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var entity = _mapper.Map<UserSubscription>(dto);

                // Renk ve Katalog kontrolü
                if (string.IsNullOrEmpty(entity.ColorCode) && entity.CatalogId.HasValue)
                {
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

                // Önce veritabanına SaveChanges yapıyoruz (ID oluşması vs. için gerekebilir)
                await _unitOfWork.CommitAsync();

                // Her şey yolundaysa Transaction'ı onayla
                await _unitOfWork.CommitTransactionAsync();

                var newDto = _mapper.Map<UserSubscriptionDto>(entity);
                return CustomResponseDto<UserSubscriptionDto>.Success(200, newDto);
            }
            catch (Exception)
            {
                // Hata durumunda işlemleri geri al
                await _unitOfWork.RollbackTransactionAsync();
                throw; // Hatayı middleware yakalaması için fırlatıyoruz
            }
        }

        public async Task<CustomResponseDto<List<UserSubscriptionDto>>> GetUserSubscriptionsAsync(string userId)
        {
            // Read işlemlerinde genellikle Transaction gerekmez, mevcut yapıyı koruyoruz.
            var subscriptions = await _repo.Where(x => x.UserId == userId)
                                           .Include(x => x.Catalog)
                                           .ToListAsync();

            var subscriptionDtos = _mapper.Map<List<UserSubscriptionDto>>(subscriptions);

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
            // Silme işlemi de kritik olduğu için Transaction içine alabiliriz, 
            // ancak talep create/update içindi. Tutarlılık adına buraya da ekliyorum.
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var entity = await _repo.GetByIdAsync(id);
                if (entity == null)
                {
                    // Kayıt yoksa transaction rollback yapmaya gerek yok ama temiz kapatmak iyidir.
                    await _unitOfWork.RollbackTransactionAsync();
                    return CustomResponseDto<bool>.Fail(404, "Kayıt bulunamadı");
                }

                _repo.Remove(entity);
                await _unitOfWork.CommitAsync();
                await _unitOfWork.CommitTransactionAsync();

                return CustomResponseDto<bool>.Success(204);
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<CustomResponseDto<bool>> UpdateSubscriptionAsync(UserSubscriptionDto dto)
        {
            // Güncelleme öncesi kaydın varlığını kontrol etmek mantıklıdır.
            // Bu sorguyu Transaction dışında yapabiliriz (Dirty Read önemsizse), 
            // ama tam tutarlılık için içeri alıyorum.

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                // 1. Mevcut kaydı çek
                var entity = await _repo.GetByIdAsync(dto.Id);

                if (entity == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return CustomResponseDto<bool>.Fail(404, "Abonelik bulunamadı.");
                }

                // 2. Mevcut rengi yedekle
                var oldColor = entity.ColorCode;

                // 3. DTO verisini Entity üzerine yaz
                _mapper.Map(dto, entity);

                // --- RENK KONTROL MANTIĞI (Aynen Korundu) ---
                if (string.IsNullOrEmpty(entity.ColorCode))
                {
                    if (!string.IsNullOrEmpty(oldColor))
                    {
                        entity.ColorCode = oldColor;
                    }
                    else if (entity.CatalogId.HasValue)
                    {
                        var catalogItem = await _catalogRepo.GetByIdAsync(entity.CatalogId.Value);
                        if (catalogItem != null)
                        {
                            entity.ColorCode = catalogItem.ColorCode;
                        }
                    }
                    else
                    {
                        entity.ColorCode = "#333333";
                    }
                }
                // --- RENK KONTROL BİTİŞ ---

                _repo.Update(entity);

                // DB'ye yansıt
                await _unitOfWork.CommitAsync();

                // Transaction'ı onayla
                await _unitOfWork.CommitTransactionAsync();

                return CustomResponseDto<bool>.Success(204);
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
    }
}