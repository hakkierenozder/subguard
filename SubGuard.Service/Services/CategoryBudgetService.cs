using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Enums;
using SubGuard.Core.Services;
using SubGuard.Core.UnitOfWork;

namespace SubGuard.Service.Services
{
    public class CategoryBudgetService : ICategoryBudgetService
    {
        private readonly AppDbContext _db;
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _unitOfWork;

        public CategoryBudgetService(
            AppDbContext db,
            UserManager<AppUser> userManager,
            IUnitOfWork unitOfWork)
        {
            _db = db;
            _userManager = userManager;
            _unitOfWork = unitOfWork;
        }

        public async Task<CustomResponseDto<List<CategoryBudgetDto>>> GetAllAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<List<CategoryBudgetDto>>.Fail(404, "Kullanıcı bulunamadı.");

            var currency = user.MonthlyBudgetCurrency ?? "TRY";
            var threshold = user.BudgetAlertThreshold > 0 ? user.BudgetAlertThreshold : 80;

            // Kullanıcının kategori bütçelerini çek
            var budgets = await _db.CategoryBudgets
                .Where(b => b.UserId == userId)
                .ToListAsync();

            // Kategori bazlı aylık harcamayı DB'de GROUP BY + SUM ile hesapla
            var spendingByCategory = await _db.UserSubscriptions
                .Where(s => s.UserId == userId
                         && s.Status == SubscriptionStatus.Active
                         && s.Currency == currency)
                .GroupBy(s => s.Category)
                .Select(g => new
                {
                    Category = g.Key,
                    Total = g.Sum(s => s.BillingPeriod == BillingPeriod.Yearly ? s.Price / 12m : s.Price)
                })
                .ToDictionaryAsync(x => x.Category, x => x.Total);

            var result = budgets.Select(b =>
            {
                var spent = spendingByCategory.TryGetValue(b.Category, out var s) ? s : 0m;
                return new CategoryBudgetDto
                {
                    Category = b.Category,
                    MonthlyLimit = b.MonthlyLimit,
                    Spent = spent,
                    Currency = currency,
                    IsNearLimit = spent >= b.MonthlyLimit * threshold / 100m
                };
            }).ToList();

            return CustomResponseDto<List<CategoryBudgetDto>>.Success(200, result);
        }

        public async Task<CustomResponseDto<CategoryBudgetDto>> UpsertAsync(string userId, UpsertCategoryBudgetDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<CategoryBudgetDto>.Fail(404, "Kullanıcı bulunamadı.");

            var currency = user.MonthlyBudgetCurrency ?? "TRY";
            var threshold = user.BudgetAlertThreshold > 0 ? user.BudgetAlertThreshold : 80;

            // Mevcut kayıt var mı?
            var existing = await _db.CategoryBudgets
                .FirstOrDefaultAsync(b => b.UserId == userId && b.Category == dto.Category);

            if (existing != null)
            {
                existing.MonthlyLimit = dto.MonthlyLimit;
            }
            else
            {
                existing = new CategoryBudget
                {
                    UserId = userId,
                    Category = dto.Category,
                    MonthlyLimit = dto.MonthlyLimit
                };
                await _db.CategoryBudgets.AddAsync(existing);
            }

            await _unitOfWork.CommitAsync();

            // Mevcut harcamayı hesapla
            var spent = await _db.UserSubscriptions
                .Where(s => s.UserId == userId
                         && s.Category == dto.Category
                         && s.Status == SubscriptionStatus.Active
                         && s.Currency == currency)
                .SumAsync(s => s.BillingPeriod == BillingPeriod.Yearly ? s.Price / 12m : s.Price);

            var result = new CategoryBudgetDto
            {
                Category = existing.Category,
                MonthlyLimit = existing.MonthlyLimit,
                Spent = spent,
                Currency = currency,
                IsNearLimit = spent >= existing.MonthlyLimit * threshold / 100m
            };

            return CustomResponseDto<CategoryBudgetDto>.Success(200, result);
        }

        public async Task<CustomResponseDto<bool>> DeleteAsync(string userId, string category)
        {
            var existing = await _db.CategoryBudgets
                .FirstOrDefaultAsync(b => b.UserId == userId && b.Category == category);

            if (existing == null)
                return CustomResponseDto<bool>.Fail(404, "Kategori bütçesi bulunamadı.");

            existing.IsDeleted = true;
            await _unitOfWork.CommitAsync();

            return CustomResponseDto<bool>.Success(200, true);
        }
    }
}
