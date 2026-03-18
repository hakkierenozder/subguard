using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SubGuard.Core.Constants;
using SubGuard.Core.DTOs;
using SubGuard.Core.Enums;
using SubGuard.Core.Entities;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;
using SubGuard.Core.UnitOfWork;
using System.Text.Json;

namespace SubGuard.Service.Services
{
    public class UserSubscriptionService : IUserSubscriptionService
    {
        private readonly IGenericRepository<UserSubscription> _repo;
        private readonly IGenericRepository<Catalog> _catalogRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<UserSubscriptionService> _logger;
        private readonly UserManager<AppUser> _userManager;

        public UserSubscriptionService(
            IGenericRepository<UserSubscription> repo,
            IGenericRepository<Catalog> catalogRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<UserSubscriptionService> logger,
            UserManager<AppUser> userManager)
        {
            _repo = repo;
            _catalogRepo = catalogRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _userManager = userManager;
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

        public async Task<CustomResponseDto<PagedResponseDto<UserSubscriptionDto>>> GetUserSubscriptionsAsync(string userId, int page, int pageSize)
        {
            var query = _repo.Where(x => x.UserId == userId).Include(x => x.Catalog);

            var totalCount = await query.CountAsync();

            var subscriptions = await query
                .OrderByDescending(x => x.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = _mapper.Map<List<UserSubscriptionDto>>(subscriptions);

            foreach (var dto in items)
            {
                var entity = subscriptions.FirstOrDefault(x => x.Id == dto.Id);
                dto.ColorCode = ResolveColorCode(dto.ColorCode, entity?.Catalog?.ColorCode);
            }

            var result = new PagedResponseDto<UserSubscriptionDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return CustomResponseDto<PagedResponseDto<UserSubscriptionDto>>.Success(200, result);
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

        public async Task<CustomResponseDto<bool>> ChangeStatusAsync(int id, string userId, SubscriptionStatus newStatus)
        {
            var entity = await _repo.GetByIdAsync(id);

            if (entity == null)
                return CustomResponseDto<bool>.Fail(404, "Abonelik bulunamadı.");

            if (entity.UserId != userId)
                return CustomResponseDto<bool>.Fail(403, "Bu aboneliğe erişim yetkiniz yok.");

            // Geçerli durum geçişlerini kontrol et
            var validTransitions = new Dictionary<SubscriptionStatus, List<SubscriptionStatus>>
            {
                { SubscriptionStatus.Active,    new List<SubscriptionStatus> { SubscriptionStatus.Paused, SubscriptionStatus.Cancelled } },
                { SubscriptionStatus.Paused,    new List<SubscriptionStatus> { SubscriptionStatus.Active, SubscriptionStatus.Cancelled } },
                { SubscriptionStatus.Cancelled, new List<SubscriptionStatus>() } // terminal state
            };

            if (!validTransitions[entity.Status].Contains(newStatus))
                return CustomResponseDto<bool>.Fail(422, $"'{entity.Status}' durumundan '{newStatus}' durumuna geçiş yapılamaz.");

            entity.Status = newStatus;
            entity.IsActive = newStatus == SubscriptionStatus.Active;

            switch (newStatus)
            {
                case SubscriptionStatus.Paused:
                    entity.PausedDate = DateTime.UtcNow;
                    break;
                case SubscriptionStatus.Cancelled:
                    entity.CancelledDate = DateTime.UtcNow;
                    break;
                case SubscriptionStatus.Active:
                    entity.PausedDate = null;
                    break;
            }

            _repo.Update(entity);
            await _unitOfWork.CommitAsync();

            _logger.LogInformation("Abonelik durumu değiştirildi. UserId: {UserId}, SubscriptionId: {Id}, YeniDurum: {Status}",
                userId, id, newStatus);

            return CustomResponseDto<bool>.Success(200, true);
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

        // --- Paylaşım ---

        public async Task<CustomResponseDto<bool>> ShareSubscriptionAsync(int id, string ownerId, string targetEmail)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return CustomResponseDto<bool>.Fail(404, "Abonelik bulunamadı.");
            if (entity.UserId != ownerId) return CustomResponseDto<bool>.Fail(403, "Bu aboneliği paylaşma yetkiniz yok.");

            var targetUser = await _userManager.FindByEmailAsync(targetEmail);
            if (targetUser == null) return CustomResponseDto<bool>.Fail(404, $"'{targetEmail}' adresinde kayıtlı kullanıcı bulunamadı.");
            if (targetUser.Id == ownerId) return CustomResponseDto<bool>.Fail(400, "Aboneliği kendinizle paylaşamazsınız.");

            var sharedWith = DeserializeSharedWith(entity.SharedWithJson);
            if (sharedWith.Contains(targetUser.Id)) return CustomResponseDto<bool>.Fail(409, "Bu kullanıcıyla zaten paylaşılmış.");

            sharedWith.Add(targetUser.Id);
            entity.SharedWithJson = JsonSerializer.Serialize(sharedWith);
            _repo.Update(entity);
            await _unitOfWork.CommitAsync();

            _logger.LogInformation("Abonelik paylaşıldı. SubscriptionId: {Id}, Hedef: {Email}", id, targetEmail);
            return CustomResponseDto<bool>.Success(200, true);
        }

        public async Task<CustomResponseDto<bool>> RemoveShareAsync(int id, string ownerId, string targetUserId)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return CustomResponseDto<bool>.Fail(404, "Abonelik bulunamadı.");
            if (entity.UserId != ownerId) return CustomResponseDto<bool>.Fail(403, "Bu aboneliğe erişim yetkiniz yok.");

            var sharedWith = DeserializeSharedWith(entity.SharedWithJson);
            if (!sharedWith.Remove(targetUserId)) return CustomResponseDto<bool>.Fail(404, "Bu kullanıcı paylaşım listesinde değil.");

            entity.SharedWithJson = sharedWith.Count > 0 ? JsonSerializer.Serialize(sharedWith) : null;
            _repo.Update(entity);
            await _unitOfWork.CommitAsync();

            return CustomResponseDto<bool>.Success(200, true);
        }

        public async Task<CustomResponseDto<PagedResponseDto<UserSubscriptionDto>>> GetSharedWithMeAsync(string userId, int page, int pageSize)
        {
            // SharedWithJson jsonb tipinde tutulduğundan EF Core'un üreteceği strpos() çağrısı
            // PostgreSQL tarafından jsonb → text implicit cast hatası verir (22P02).
            // DB'de yalnızca NULL olmayan kayıtları çekip kesin filtreyi in-memory yapıyoruz.
            var query = _repo.Where(x => x.IsActive && x.SharedWithJson != null)
                             .Include(x => x.Catalog);

            var subscriptions = await query
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            // In-memory doğrulama: deserialize ederek kesin eşleşmeyi onayla
            var filtered = subscriptions.Where(x =>
            {
                var list = DeserializeSharedWith(x.SharedWithJson);
                return list.Contains(userId);
            }).ToList();

            // Sayfalama doğru sonuç sayısı üzerinden yapılır
            var totalCount = filtered.Count;
            var paged = filtered
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var items = _mapper.Map<List<UserSubscriptionDto>>(paged);
            foreach (var dto in items)
            {
                var entity = paged.FirstOrDefault(x => x.Id == dto.Id);
                dto.ColorCode = ResolveColorCode(dto.ColorCode, entity?.Catalog?.ColorCode);
            }

            return CustomResponseDto<PagedResponseDto<UserSubscriptionDto>>.Success(200, new PagedResponseDto<UserSubscriptionDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        private List<string> DeserializeSharedWith(string? json)
        {
            if (string.IsNullOrEmpty(json)) return new List<string>();
            try { return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>(); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SharedWithJson parse hatası. Ham değer: {Json}", json);
                return new List<string>();
            }
        }

        // --- Kullanım Geçmişi ---

        private async Task<(UserSubscription? entity, CustomResponseDto<T>? error)> GetOwnedSubscription<T>(int id, string userId)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return (null, CustomResponseDto<T>.Fail(404, "Abonelik bulunamadı."));
            if (entity.UserId != userId) return (null, CustomResponseDto<T>.Fail(403, "Bu aboneliğe erişim yetkiniz yok."));
            return (entity, null);
        }

        private List<UsageLogDto> DeserializeUsageLogs(string? json)
        {
            if (string.IsNullOrEmpty(json)) return new List<UsageLogDto>();
            try { return JsonSerializer.Deserialize<List<UsageLogDto>>(json) ?? new List<UsageLogDto>(); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UsageHistoryJson parse hatası. Ham değer: {Json}", json);
                return new List<UsageLogDto>();
            }
        }

        public async Task<CustomResponseDto<List<UsageLogDto>>> GetUsageHistoryAsync(int id, string userId)
        {
            var (entity, error) = await GetOwnedSubscription<List<UsageLogDto>>(id, userId);
            if (error != null) return error;

            var logs = DeserializeUsageLogs(entity!.UsageHistoryJson)
                .OrderByDescending(x => x.Date)
                .ToList();

            return CustomResponseDto<List<UsageLogDto>>.Success(200, logs);
        }

        public async Task<CustomResponseDto<UsageLogDto>> AddUsageLogAsync(int id, string userId, AddUsageLogDto dto)
        {
            var (entity, error) = await GetOwnedSubscription<UsageLogDto>(id, userId);
            if (error != null) return error;

            var logs = DeserializeUsageLogs(entity!.UsageHistoryJson);

            var newLog = new UsageLogDto
            {
                Id = Guid.NewGuid().ToString("N")[..8],
                Date = DateTime.UtcNow,
                Note = dto.Note,
                Amount = dto.Amount,
                Unit = dto.Unit
            };

            logs.Add(newLog);
            entity.UsageHistoryJson = JsonSerializer.Serialize(logs);
            _repo.Update(entity);
            await _unitOfWork.CommitAsync();

            return CustomResponseDto<UsageLogDto>.Success(201, newLog);
        }

        public async Task<CustomResponseDto<bool>> DeleteUsageLogAsync(int id, string userId, string logId)
        {
            var (entity, error) = await GetOwnedSubscription<bool>(id, userId);
            if (error != null) return error;

            var logs = DeserializeUsageLogs(entity!.UsageHistoryJson);
            var removed = logs.RemoveAll(x => x.Id == logId);

            if (removed == 0)
                return CustomResponseDto<bool>.Fail(404, "Kullanım kaydı bulunamadı.");

            entity.UsageHistoryJson = logs.Count > 0 ? JsonSerializer.Serialize(logs) : null;
            _repo.Update(entity);
            await _unitOfWork.CommitAsync();

            return CustomResponseDto<bool>.Success(200, true);
        }
    }
}
