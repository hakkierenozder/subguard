using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Enums;
using SubGuard.Core.Services;
// AppDbContext global namespace'te tanımlı — ayrıca using gerekmez

namespace SubGuard.Service.Services
{
    public class AdminService : IAdminService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly AppDbContext _db;
        private readonly ILogger<AdminService> _logger;

        public AdminService(
            UserManager<AppUser> userManager,
            AppDbContext db,
            ILogger<AdminService> logger)
        {
            _userManager = userManager;
            _db = db;
            _logger = logger;
        }

        public async Task<CustomResponseDto<PagedResponseDto<AdminUserDto>>> GetUsersAsync(
            string? search, int page, int pageSize)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            // IQueryable üzerinde çalışıyoruz — DB'ye tek sorgu gidecek
            var query = _userManager.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(u =>
                    (u.Email != null && u.Email.ToLower().Contains(s)) ||
                    (u.FullName != null && u.FullName.ToLower().Contains(s)));
            }

            var totalCount = await query.CountAsync();

            var users = await query
                .OrderBy(u => u.Email)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Abonelik sayıları: tek toplu sorgu
            var userIds = users.Select(u => u.Id).ToList();
            var subCounts = await _db.UserSubscriptions
                .Where(s => userIds.Contains(s.UserId) && !s.IsDeleted)
                .GroupBy(s => s.UserId)
                .Select(g => new { UserId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.UserId, x => x.Count);

            // Rol kontrolü: tek toplu sorgu (AspNetUserRoles üzerinden)
            var adminRoleId = await _db.Roles
                .Where(r => r.Name == "Admin")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            HashSet<string> adminUserIds = new();
            if (adminRoleId != null)
            {
                adminUserIds = (await _db.UserRoles
                    .Where(ur => ur.RoleId == adminRoleId && userIds.Contains(ur.UserId))
                    .Select(ur => ur.UserId)
                    .ToListAsync()).ToHashSet();
            }

            var now = DateTimeOffset.UtcNow;
            var items = users.Select(u => new AdminUserDto
            {
                Id = u.Id,
                FullName = u.FullName ?? string.Empty,
                Email = u.Email ?? string.Empty,
                IsActive = u.LockoutEnd == null || u.LockoutEnd <= now,
                IsAdmin = adminUserIds.Contains(u.Id),
                CreatedDate = u.CreatedDate,
                SubscriptionCount = subCounts.GetValueOrDefault(u.Id, 0)
            }).ToList();

            return CustomResponseDto<PagedResponseDto<AdminUserDto>>.Success(200,
                new PagedResponseDto<AdminUserDto>
                {
                    Items = items,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize
                });
        }

        public async Task<CustomResponseDto<AdminUserDto>> GetUserDetailAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<AdminUserDto>.Fail(404, "Kullanıcı bulunamadı.");

            var subCount = await _db.UserSubscriptions
                .Where(s => s.UserId == userId && !s.IsDeleted)
                .CountAsync();

            var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            var now = DateTimeOffset.UtcNow;

            return CustomResponseDto<AdminUserDto>.Success(200, new AdminUserDto
            {
                Id = user.Id,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                IsActive = user.LockoutEnd == null || user.LockoutEnd <= now,
                IsAdmin = isAdmin,
                CreatedDate = user.CreatedDate,
                SubscriptionCount = subCount
            });
        }

        public async Task<CustomResponseDto<bool>> DeactivateUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.MaxValue;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("Kullanıcı askıya alındı. UserId: {UserId}", userId);
            return CustomResponseDto<bool>.Success(200, true);
        }

        public async Task<CustomResponseDto<bool>> ActivateUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            user.LockoutEnd = null;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("Kullanıcı askıdan çıkarıldı. UserId: {UserId}", userId);
            return CustomResponseDto<bool>.Success(200, true);
        }

        public async Task<CustomResponseDto<AdminStatsDto>> GetStatsAsync()
        {
            var totalUsers = await _userManager.Users.CountAsync();

            var totalSubs = await _db.UserSubscriptions
                .Where(s => !s.IsDeleted)
                .CountAsync();

            var activeSubs = await _db.UserSubscriptions
                .Where(s => !s.IsDeleted && s.Status == SubscriptionStatus.Active)
                .CountAsync();

            // En popüler 5 katalog — GroupBy+Take+Join EF Core'da tek sorguda çevrilemiyor;
            // önce sayıları çekip RAM'de catalog adlarıyla eşleştiriyoruz.
            var topCatalogCounts = await _db.UserSubscriptions
                .Where(s => !s.IsDeleted && s.CatalogId != null)
                .GroupBy(s => s.CatalogId!.Value)
                .Select(g => new { CatalogId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            var topCatalogIds = topCatalogCounts.Select(x => x.CatalogId).ToList();
            var catalogNames = await _db.Catalogs
                .Where(c => topCatalogIds.Contains(c.Id))
                .Select(c => new { c.Id, c.Name, c.LogoUrl })
                .ToListAsync();

            var topCatalogs = topCatalogCounts
                .Select(x =>
                {
                    var cat = catalogNames.FirstOrDefault(c => c.Id == x.CatalogId);
                    return new CatalogStatDto
                    {
                        Name    = cat?.Name ?? "—",
                        LogoUrl = cat?.LogoUrl,
                        Count   = x.Count
                    };
                })
                .ToList();

            // Tüm katalog istatistikleri
            var totalCatalogs = await _db.Catalogs.Where(c => !c.IsDeleted).CountAsync();

            var allCatalogCounts = await _db.UserSubscriptions
                .Where(s => !s.IsDeleted && s.CatalogId != null)
                .GroupBy(s => s.CatalogId!.Value)
                .Select(g => new { CatalogId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(20)
                .ToListAsync();

            var allCatalogIds = allCatalogCounts.Select(x => x.CatalogId).ToList();
            var allCatalogDetails = await _db.Catalogs
                .Where(c => allCatalogIds.Contains(c.Id))
                .Select(c => new { c.Id, c.Name, c.LogoUrl, c.Category })
                .ToListAsync();

            var allCatalogStats = allCatalogCounts
                .Select(x => {
                    var cat = allCatalogDetails.FirstOrDefault(c => c.Id == x.CatalogId);
                    return new CatalogStatDto
                    {
                        Name     = cat?.Name ?? "—",
                        LogoUrl  = cat?.LogoUrl,
                        Category = cat?.Category,
                        Count    = x.Count
                    };
                })
                .ToList();

            // Kategori bazlı katalog dağılımı
            var categoryDist = await _db.Catalogs
                .Where(c => !c.IsDeleted && c.Category != null)
                .GroupBy(c => c.Category)
                .Select(g => new CategoryStatDto
                {
                    Category     = g.Key,
                    CatalogCount = g.Count()
                })
                .ToListAsync();

            // Her kategorinin toplam abonelik sayısını ekle
            var catSubCounts = await _db.UserSubscriptions
                .Where(s => !s.IsDeleted && s.CatalogId != null)
                .Join(_db.Catalogs, s => s.CatalogId, c => c.Id, (s, c) => new { c.Category })
                .Where(x => x.Category != null)
                .GroupBy(x => x.Category)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Category!, x => x.Count);

            foreach (var cat in categoryDist)
                cat.SubscriptionCount = catSubCounts.GetValueOrDefault(cat.Category, 0);

            return CustomResponseDto<AdminStatsDto>.Success(200, new AdminStatsDto
            {
                TotalUsers           = totalUsers,
                TotalSubscriptions   = totalSubs,
                ActiveSubscriptions  = activeSubs,
                TopCatalogs          = topCatalogs,
                TotalCatalogs        = totalCatalogs,
                AllCatalogStats      = allCatalogStats,
                CategoryDistribution = categoryDist.OrderByDescending(x => x.SubscriptionCount).ToList(),
            });
        }
    }
}
