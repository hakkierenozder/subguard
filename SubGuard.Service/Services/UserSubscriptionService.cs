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
        private readonly AppDbContext _db;
        private readonly INotificationService _notificationService;

        public UserSubscriptionService(
            IGenericRepository<UserSubscription> repo,
            IGenericRepository<Catalog> catalogRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<UserSubscriptionService> logger,
            UserManager<AppUser> userManager,
            AppDbContext db,
            INotificationService notificationService)
        {
            _repo = repo;
            _catalogRepo = catalogRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _userManager = userManager;
            _db = db;
            _notificationService = notificationService;
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

        public async Task<CustomResponseDto<UserSubscriptionDto>> AddSubscriptionAsync(AddUserSubscriptionDto dto, string userId)
        {
            var duplicate = await _repo.Where(x => x.UserId == userId && x.Name == dto.Name).AnyAsync();
            if (duplicate)
            {
                _logger.LogWarning("Mükerrer abonelik ekleme denemesi. UserId: {UserId}, Name: {Name}", userId, dto.Name);
                return CustomResponseDto<UserSubscriptionDto>.Fail(409, $"'{dto.Name}' adında bir aboneliğiniz zaten mevcut.");
            }

            try
            {
                var entity = _mapper.Map<UserSubscription>(dto);
                entity.UserId = userId;
                // U-8: Kategori normalize — "müzik", "MÜZİK", "Müzik" → "Müzik"
                if (!string.IsNullOrWhiteSpace(entity.Category))
                    entity.Category = System.Globalization.CultureInfo.GetCultureInfo("tr-TR")
                        .TextInfo.ToTitleCase(entity.Category.Trim().ToLower());
                entity.ColorCode = await ResolveColorCodeAsync(entity);

                await _repo.AddAsync(entity);
                await _unitOfWork.CommitAsync();

                _logger.LogInformation("Abonelik eklendi. UserId: {UserId}, Name: {Name}", userId, entity.Name);
                return CustomResponseDto<UserSubscriptionDto>.Success(201, _mapper.Map<UserSubscriptionDto>(entity));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Abonelik ekleme hatası. UserId: {UserId}", userId);
                throw;
            }
        }

        public async Task<CustomResponseDto<PagedResponseDto<UserSubscriptionDto>>> GetUserSubscriptionsAsync(string userId, int page, int pageSize, string? q = null)
        {
            IQueryable<UserSubscription> query = _repo.Where(x => x.UserId == userId).Include(x => x.Catalog);
            if (!string.IsNullOrWhiteSpace(q))
                query = query.Where(x => EF.Functions.ILike(x.Name, $"%{q}%"));

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
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null)
                return CustomResponseDto<bool>.Fail(404, "Kayıt bulunamadı.");

            if (entity.UserId != userId)
            {
                _logger.LogWarning("Yetkisiz abonelik silme denemesi. UserId: {UserId}, SubscriptionId: {Id}", userId, id);
                return CustomResponseDto<bool>.Fail(403, "Bu aboneliği silme yetkiniz yok.");
            }

            _repo.Remove(entity);
            await _unitOfWork.CommitAsync();

            _logger.LogInformation("Abonelik silindi. UserId: {UserId}, SubscriptionId: {Id}", userId, id);
            return CustomResponseDto<bool>.Success(204);
        }

        public async Task<CustomResponseDto<bool>> ChangeStatusAsync(int id, string userId, SubscriptionStatus newStatus, bool forceCancel = false)
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

            // İptal edilmek isteniyorsa ve aktif bir kontrat varsa onay iste
            if (newStatus == SubscriptionStatus.Cancelled
                && entity.HasContract
                && entity.ContractEndDate.HasValue
                && entity.ContractEndDate.Value > DateTime.UtcNow
                && !forceCancel)
            {
                var endDateStr = entity.ContractEndDate.Value.ToString("dd.MM.yyyy");
                return CustomResponseDto<bool>.Fail(
                    409,
                    $"Bu aboneliğin sözleşmesi {endDateStr} tarihine kadar geçerlidir. " +
                    "Erken iptal etmek için 'forceCancel: true' ile tekrar gönderin.");
            }

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

        public async Task<CustomResponseDto<bool>> UpdateSubscriptionAsync(int id, UpdateUserSubscriptionDto dto, string userId)
        {
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var entity = await _repo.GetByIdAsync(id);
                if (entity == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return CustomResponseDto<bool>.Fail(404, "Abonelik bulunamadı.");
                }

                if (entity.UserId != userId)
                {
                    _logger.LogWarning("Yetkisiz abonelik güncelleme denemesi. UserId: {UserId}, SubscriptionId: {Id}", userId, id);
                    await _unitOfWork.RollbackTransactionAsync();
                    return CustomResponseDto<bool>.Fail(403, "Bu aboneliği güncelleme yetkiniz yok.");
                }

                var duplicate = await _repo.Where(x => x.UserId == userId && x.Name == dto.Name && x.Id != id).AnyAsync();
                if (duplicate)
                {
                    _logger.LogWarning("Mükerrer abonelik güncelleme denemesi. UserId: {UserId}, Name: {Name}", userId, dto.Name);
                    await _unitOfWork.RollbackTransactionAsync();
                    return CustomResponseDto<bool>.Fail(409, $"'{dto.Name}' adında bir aboneliğiniz zaten mevcut.");
                }

                var oldColor = entity.ColorCode;
                var oldPrice = entity.Price;
                _mapper.Map(dto, entity);
                // U-8: Kategori normalize
                if (!string.IsNullOrWhiteSpace(entity.Category))
                    entity.Category = System.Globalization.CultureInfo.GetCultureInfo("tr-TR")
                        .TextInfo.ToTitleCase(entity.Category.Trim().ToLower());
                entity.ColorCode = await ResolveColorCodeAsync(entity, oldColor);

                // Fiyat değiştiyse geçmişe kaydet
                if (oldPrice != entity.Price)
                {
                    var priceHistory = new PriceHistory
                    {
                        SubscriptionId = entity.Id,
                        UserId = entity.UserId,
                        OldPrice = oldPrice,
                        NewPrice = entity.Price,
                        Currency = entity.Currency,
                        ChangedAt = DateTime.UtcNow
                    };
                    await _db.PriceHistories.AddAsync(priceHistory);
                }

                _repo.Update(entity);
                await _unitOfWork.CommitAsync();
                await _unitOfWork.CommitTransactionAsync();

                _logger.LogInformation("Abonelik güncellendi. UserId: {UserId}, SubscriptionId: {Id}", userId, id);
                return CustomResponseDto<bool>.Success(200, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Abonelik güncelleme hatası. Id: {Id}", id);
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        // --- Paylaşım ---

        public async Task<CustomResponseDto<bool>> ShareSubscriptionAsync(int id, string ownerId, string targetEmail)
        {
            var targetUser = await _userManager.FindByEmailAsync(targetEmail);
            if (targetUser == null) return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");
            if (targetUser.Id == ownerId) return CustomResponseDto<bool>.Fail(400, "Aboneliği kendinizle paylaşamazsınız.");

            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return CustomResponseDto<bool>.Fail(404, "Abonelik bulunamadı.");
            if (entity.UserId != ownerId) return CustomResponseDto<bool>.Fail(403, "Bu aboneliği paylaşma yetkiniz yok.");

            var alreadyShared = await _db.SubscriptionShares
                .AnyAsync(s => s.SubscriptionId == id && s.SharedUserId == targetUser.Id);
            if (alreadyShared) return CustomResponseDto<bool>.Fail(409, "Bu kullanıcıyla zaten paylaşılmış.");

            await _db.SubscriptionShares.AddAsync(new SubscriptionShare
            {
                SubscriptionId = id,
                SharedUserId = targetUser.Id,
                SharedAt = DateTime.UtcNow
            });
            await _unitOfWork.CommitAsync();

            // Hedef kullanıcıya paylaşım bildirimi gönder
            var owner = await _userManager.FindByIdAsync(ownerId);
            var ownerName = owner?.FullName ?? owner?.Email ?? "Bir kullanıcı";
            try
            {
                await _notificationService.QueueShareNotificationAsync(targetUser.Id, id, entity.Name, ownerName);
            }
            catch (Exception ex)
            {
                // Bildirim hatası paylaşım işlemini geri almasın
                _logger.LogWarning(ex, "Paylaşım bildirimi kuyruğa eklenemedi. SubscriptionId: {Id}", id);
            }

            _logger.LogInformation("Abonelik paylaşıldı. SubscriptionId: {Id}, Hedef: {Email}", id, targetEmail);
            return CustomResponseDto<bool>.Success(200, true);
        }

        public async Task<CustomResponseDto<bool>> RemoveShareAsync(int id, string ownerId, string targetUserId)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return CustomResponseDto<bool>.Fail(404, "Abonelik bulunamadı.");
            if (entity.UserId != ownerId) return CustomResponseDto<bool>.Fail(403, "Bu aboneliğe erişim yetkiniz yok.");

            var share = await _db.SubscriptionShares
                .FirstOrDefaultAsync(s => s.SubscriptionId == id && s.SharedUserId == targetUserId);
            if (share == null) return CustomResponseDto<bool>.Fail(404, "Bu kullanıcı paylaşım listesinde değil.");

            _db.SubscriptionShares.Remove(share);
            await _unitOfWork.CommitAsync();

            return CustomResponseDto<bool>.Success(200, true);
        }

        public async Task<CustomResponseDto<PagedResponseDto<SharedWithMeItemDto>>> GetSharedWithMeAsync(string userId, int page, int pageSize)
        {
            // T-3: SubscriptionShares tablosu sayesinde artık raw SQL + IgnoreQueryFilters yok.
            var baseQuery = _db.SubscriptionShares
                .Where(s => s.SharedUserId == userId
                         && !s.Subscription.IsDeleted
                         && s.Subscription.IsActive)
                .Include(s => s.Subscription).ThenInclude(sub => sub.Catalog)
                .OrderByDescending(s => s.SharedAt);

            var totalCount = await baseQuery.CountAsync();
            var shares = await baseQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Owner bilgileri için unique userId'ler tek sorguda çözümleniyor
            var ownerIds = shares.Select(s => s.Subscription.UserId).Distinct().ToList();
            var ownerMap = new Dictionary<string, AppUser>();
            foreach (var ownerId in ownerIds)
            {
                var owner = await _userManager.FindByIdAsync(ownerId);
                if (owner != null) ownerMap[ownerId] = owner;
            }

            var items = shares.Select(s =>
            {
                var dto = _mapper.Map<SharedWithMeItemDto>(s.Subscription);
                dto.ColorCode  = ResolveColorCode(dto.ColorCode, s.Subscription.Catalog?.ColorCode);
                dto.SharedAt   = s.SharedAt;
                if (ownerMap.TryGetValue(s.Subscription.UserId, out var owner))
                {
                    dto.OwnerEmail    = owner.Email ?? string.Empty;
                    dto.OwnerFullName = owner.FullName ?? string.Empty;
                }
                return dto;
            }).ToList();

            return CustomResponseDto<PagedResponseDto<SharedWithMeItemDto>>.Success(200, new PagedResponseDto<SharedWithMeItemDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        // --- Kullanım Geçmişi ---

        private async Task<(UserSubscription? entity, CustomResponseDto<T>? error)> GetOwnedSubscription<T>(int id, string userId)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return (null, CustomResponseDto<T>.Fail(404, "Abonelik bulunamadı."));
            if (entity.UserId != userId) return (null, CustomResponseDto<T>.Fail(403, "Bu aboneliğe erişim yetkiniz yok."));
            return (entity, null);
        }

        public async Task<CustomResponseDto<List<UsageLogDto>>> GetUsageHistoryAsync(int id, string userId)
        {
            var (_, error) = await GetOwnedSubscription<List<UsageLogDto>>(id, userId);
            if (error != null) return error;

            var logs = await _db.SubscriptionUsageLogs
                .Where(l => l.SubscriptionId == id)
                .OrderByDescending(l => l.LoggedAt)
                .Select(l => new UsageLogDto
                {
                    Id     = l.Id.ToString(),
                    Date   = l.LoggedAt,
                    Note   = l.Note,
                    Amount = l.Amount,
                    Unit   = l.Unit
                })
                .ToListAsync();

            return CustomResponseDto<List<UsageLogDto>>.Success(200, logs);
        }

        public async Task<CustomResponseDto<UsageLogDto>> AddUsageLogAsync(int id, string userId, AddUsageLogDto dto)
        {
            var (_, error) = await GetOwnedSubscription<UsageLogDto>(id, userId);
            if (error != null) return error;

            var log = new SubscriptionUsageLog
            {
                SubscriptionId = id,
                UserId         = userId,
                Note           = dto.Note,
                Amount         = dto.Amount,
                Unit           = dto.Unit,
                LoggedAt       = DateTime.UtcNow,
                CreatedDate    = DateTime.UtcNow
            };

            await _db.SubscriptionUsageLogs.AddAsync(log);
            await _unitOfWork.CommitAsync();

            return CustomResponseDto<UsageLogDto>.Success(201, new UsageLogDto
            {
                Id     = log.Id.ToString(),
                Date   = log.LoggedAt,
                Note   = log.Note,
                Amount = log.Amount,
                Unit   = log.Unit
            });
        }

        public async Task<CustomResponseDto<bool>> DeleteUsageLogAsync(int id, string userId, string logId)
        {
            var (_, error) = await GetOwnedSubscription<bool>(id, userId);
            if (error != null) return error;

            if (!int.TryParse(logId, out var logIdInt))
                return CustomResponseDto<bool>.Fail(400, "Geçersiz log ID formatı.");

            var log = await _db.SubscriptionUsageLogs
                .FirstOrDefaultAsync(l => l.Id == logIdInt && l.SubscriptionId == id);

            if (log == null)
                return CustomResponseDto<bool>.Fail(404, "Kullanım kaydı bulunamadı.");

            _db.SubscriptionUsageLogs.Remove(log);
            await _unitOfWork.CommitAsync();

            return CustomResponseDto<bool>.Success(200, true);
        }

        // --- Survey Geçmişi ---
        // Toplu güncelleme: mevcut kayıtları siler, gelenlerle değiştirir.
        public async Task<CustomResponseDto<bool>> UpdateSurveyHistoryAsync(int id, string userId, string usageHistoryJson)
        {
            var (_, error) = await GetOwnedSubscription<bool>(id, userId);
            if (error != null) return error;

            List<UsageLogDto> incoming;
            try { incoming = JsonSerializer.Deserialize<List<UsageLogDto>>(usageHistoryJson) ?? new(); }
            catch { return CustomResponseDto<bool>.Fail(400, "Geçersiz kullanım geçmişi formatı."); }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var existing = await _db.SubscriptionUsageLogs
                    .Where(l => l.SubscriptionId == id)
                    .ToListAsync();
                _db.SubscriptionUsageLogs.RemoveRange(existing);

                var newLogs = incoming.Select(dto => new SubscriptionUsageLog
                {
                    SubscriptionId = id,
                    UserId         = userId,
                    Note           = dto.Note,
                    Amount         = dto.Amount,
                    Unit           = dto.Unit,
                    LoggedAt       = dto.Date == default ? DateTime.UtcNow : dto.Date,
                    CreatedDate    = DateTime.UtcNow
                }).ToList();

                await _db.SubscriptionUsageLogs.AddRangeAsync(newLogs);
                await _unitOfWork.CommitAsync();
                await _unitOfWork.CommitTransactionAsync();

                return CustomResponseDto<bool>.Success(200, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanım geçmişi güncelleme hatası. SubscriptionId: {Id}", id);
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        // --- Fiyat Geçmişi ---

        public async Task<CustomResponseDto<List<PriceHistoryDto>>> GetPriceHistoryAsync(int id, string userId)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return CustomResponseDto<List<PriceHistoryDto>>.Fail(404, "Abonelik bulunamadı.");
            if (entity.UserId != userId) return CustomResponseDto<List<PriceHistoryDto>>.Fail(403, "Bu aboneliğe erişim yetkiniz yok.");

            var history = await _db.PriceHistories
                .Where(h => h.SubscriptionId == id && h.UserId == userId)
                .OrderByDescending(h => h.ChangedAt)
                .Select(h => new PriceHistoryDto
                {
                    OldPrice = h.OldPrice,
                    NewPrice = h.NewPrice,
                    Currency = h.Currency,
                    ChangedAt = h.ChangedAt
                })
                .ToListAsync();

            return CustomResponseDto<List<PriceHistoryDto>>.Success(200, history);
        }

        // --- Klonlama ---

        public async Task<CustomResponseDto<UserSubscriptionDto>> DuplicateSubscriptionAsync(int id, string userId)
        {
            var (source, error) = await GetOwnedSubscription<UserSubscriptionDto>(id, userId);
            if (error != null) return error;

            var copy = new UserSubscription
            {
                UserId = userId,
                CatalogId = source!.CatalogId,
                Name = $"{source.Name} (Kopya)",
                Price = source.Price,
                Currency = source.Currency,
                BillingDay = source.BillingDay,
                BillingPeriod = source.BillingPeriod,
                Category = source.Category,
                ColorCode = source.ColorCode,
                HasContract = false,
                IsActive = true,
                Status = SubscriptionStatus.Active
            };

            try
            {
                await _repo.AddAsync(copy);
                await _unitOfWork.CommitAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Abonelik klonlama hatası. SourceId: {SourceId}", id);
                throw;
            }

            _logger.LogInformation("Abonelik klonlandı. SourceId: {SourceId}, NewId: {NewId}", id, copy.Id);
            return CustomResponseDto<UserSubscriptionDto>.Success(200, _mapper.Map<UserSubscriptionDto>(copy));
        }
    }
}
