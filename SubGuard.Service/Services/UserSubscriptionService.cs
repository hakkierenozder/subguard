using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SubGuard.Core.Constants;
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
        private readonly ILogger<UserSubscriptionService> _logger;

        public UserSubscriptionService(
            IGenericRepository<UserSubscription> repo,
            IGenericRepository<Catalog> catalogRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<UserSubscriptionService> logger)
        {
            _repo = repo;
            _catalogRepo = catalogRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        // --- RENK KODU YARDIMCILARI ---

        private static string ResolveColorCode(string? entityColor, string? catalogColor) =>
            !string.IsNullOrEmpty(entityColor) ? entityColor :
            !string.IsNullOrEmpty(catalogColor) ? catalogColor :
            AppConstants.Subscription.DefaultColorCode;

        private async Task<string> ResolveColorCodeAsync(UserSubscription entity, string? precedingColor = null)
        {
            if (!string.IsNullOrEmpty(entity.ColorCode)) return entity.ColorCode;
            if (!string.IsNullOrEmpty(precedingColor)) return precedingColor;
            if (entity.CatalogId.HasValue)
            {
                var catalog = await _catalogRepo.GetByIdAsync(entity.CatalogId.Value);
                if (!string.IsNullOrEmpty(catalog?.ColorCode)) return catalog.ColorCode;
            }
            return AppConstants.Subscription.DefaultColorCode;
        }

        // --- CRUD ---

        public async Task<CustomResponseDto<UserSubscriptionDto>> AddSubscriptionAsync(UserSubscriptionDto dto)
        {
            var duplicate = await _repo.Where(x => x.UserId == dto.UserId && x.Name == dto.Name).AnyAsync();
            if (duplicate)
            {
                _logger.LogWarning("Mükerrer abonelik ekleme denemesi. UserId: {UserId}, Name: {Name}", dto.UserId, dto.Name);
                return CustomResponseDto<UserSubscriptionDto>.Fail(409, $"'{dto.Name}' adında bir aboneliğiniz zaten mevcut.");
            }

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var entity = _mapper.Map<UserSubscription>(dto);
                entity.ColorCode = await ResolveColorCodeAsync(entity);

                await _repo.AddAsync(entity);
                await _unitOfWork.CommitAsync();
                await _unitOfWork.CommitTransactionAsync();

                _logger.LogInformation("Abonelik eklendi. UserId: {UserId}, Name: {Name}", dto.UserId, entity.Name);
                return CustomResponseDto<UserSubscriptionDto>.Success(200, _mapper.Map<UserSubscriptionDto>(entity));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Abonelik ekleme hatası. UserId: {UserId}", dto.UserId);
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<CustomResponseDto<List<UserSubscriptionDto>>> GetUserSubscriptionsAsync(string userId)
        {
            var subscriptions = await _repo.Where(x => x.UserId == userId)
                                           .Include(x => x.Catalog)
                                           .ToListAsync();

            var subscriptionDtos = _mapper.Map<List<UserSubscriptionDto>>(subscriptions);

            foreach (var dto in subscriptionDtos)
            {
                var entity = subscriptions.FirstOrDefault(x => x.Id == dto.Id);
                dto.ColorCode = ResolveColorCode(dto.ColorCode, entity?.Catalog?.ColorCode);
            }

            return CustomResponseDto<List<UserSubscriptionDto>>.Success(200, subscriptionDtos);
        }

        public async Task<CustomResponseDto<bool>> RemoveSubscriptionAsync(int id, string userId)
        {
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var entity = await _repo.GetByIdAsync(id);
                if (entity == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return CustomResponseDto<bool>.Fail(404, "Kayıt bulunamadı.");
                }

                if (entity.UserId != userId)
                {
                    _logger.LogWarning("Yetkisiz abonelik silme denemesi. UserId: {UserId}, SubscriptionId: {Id}", userId, id);
                    await _unitOfWork.RollbackTransactionAsync();
                    return CustomResponseDto<bool>.Fail(403, "Bu aboneliği silme yetkiniz yok.");
                }

                _repo.Remove(entity);
                await _unitOfWork.CommitAsync();
                await _unitOfWork.CommitTransactionAsync();

                _logger.LogInformation("Abonelik silindi. UserId: {UserId}, SubscriptionId: {Id}", userId, id);
                return CustomResponseDto<bool>.Success(204);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Abonelik silme hatası. Id: {Id}", id);
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<CustomResponseDto<bool>> UpdateSubscriptionAsync(UserSubscriptionDto dto)
        {
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var entity = await _repo.GetByIdAsync(dto.Id);
                if (entity == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return CustomResponseDto<bool>.Fail(404, "Abonelik bulunamadı.");
                }

                var duplicate = await _repo.Where(x => x.UserId == dto.UserId && x.Name == dto.Name && x.Id != dto.Id).AnyAsync();
                if (duplicate)
                {
                    _logger.LogWarning("Mükerrer abonelik güncelleme denemesi. UserId: {UserId}, Name: {Name}", dto.UserId, dto.Name);
                    await _unitOfWork.RollbackTransactionAsync();
                    return CustomResponseDto<bool>.Fail(409, $"'{dto.Name}' adında bir aboneliğiniz zaten mevcut.");
                }

                var oldColor = entity.ColorCode;
                _mapper.Map(dto, entity);
                entity.ColorCode = await ResolveColorCodeAsync(entity, oldColor);

                _repo.Update(entity);
                await _unitOfWork.CommitAsync();
                await _unitOfWork.CommitTransactionAsync();

                _logger.LogInformation("Abonelik güncellendi. UserId: {UserId}, SubscriptionId: {Id}", dto.UserId, dto.Id);
                return CustomResponseDto<bool>.Success(204);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Abonelik güncelleme hatası. Id: {Id}", dto.Id);
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
    }
}
