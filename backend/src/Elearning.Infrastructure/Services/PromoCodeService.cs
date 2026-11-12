using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements promotional code validation, calculation, and administrative operations.
/// </summary>
public class PromoCodeService : IPromoCodeService
{
    private readonly ElearningDbContext _context;

    public PromoCodeService(ElearningDbContext context)
    {
        _context = context;
    }

    public async Task<PromoCodeValidationResultDto> ValidatePromoCodeAsync(ValidatePromoCodeRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto?.Code))
        {
            return new PromoCodeValidationResultDto
            {
                Valid = false,
                Message = "Please enter a promo code."
            };
        }

        var normalizedCode = dto.Code.Trim();

        // Determine base price for calculation
        decimal baseAmount = 0m;
        if (dto.Amount.HasValue && dto.Amount.Value >= 0)
        {
            baseAmount = dto.Amount.Value;
        }
        else if (dto.CourseId.HasValue)
        {
            var course = await _context.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == dto.CourseId.Value);
            if (course != null)
            {
                baseAmount = course.Price;
            }
        }

        // Query database for promo code
        var promo = await _context.PromoCodes
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Code.ToLower() == normalizedCode.ToLower());

        // If not found in database, check standard platform default promo codes as a fallback
        if (promo == null)
        {
            if (normalizedCode.Equals("totc", StringComparison.OrdinalIgnoreCase))
            {
                return BuildSuccessfulResult("TOTC", 20m, 100m, baseAmount);
            }
            if (normalizedCode.Equals("totc2026", StringComparison.OrdinalIgnoreCase))
            {
                return BuildSuccessfulResult("TOTC2026", 25m, 150m, baseAmount);
            }
            if (normalizedCode.Equals("welcome50", StringComparison.OrdinalIgnoreCase))
            {
                return BuildSuccessfulResult("WELCOME50", 50m, 50m, baseAmount);
            }

            return new PromoCodeValidationResultDto
            {
                Valid = false,
                Code = normalizedCode,
                DiscountPercentage = 0,
                MaxDiscount = null,
                DiscountAmount = 0,
                FinalAmount = baseAmount,
                Message = $"Promo code '{normalizedCode}' is not valid."
            };
        }

        // Validate promo constraints
        if (!promo.IsActive)
        {
            return BuildFailedResult(promo.Code, baseAmount, "This promo code is no longer active.");
        }

        var now = DateTime.UtcNow;
        if (promo.ValidFrom > now)
        {
            return BuildFailedResult(promo.Code, baseAmount, "This promo code is not active yet.");
        }

        if (promo.ValidUntil.HasValue && promo.ValidUntil.Value < now)
        {
            return BuildFailedResult(promo.Code, baseAmount, "This promo code has expired.");
        }

        if (promo.CurrentUsageCount >= promo.MaxUsageCount)
        {
            return BuildFailedResult(promo.Code, baseAmount, "This promo code has reached its maximum usage limit.");
        }

        return BuildSuccessfulResult(promo.Code, promo.DiscountPercentage, promo.MaxDiscountAmount, baseAmount);
    }

    public async Task<List<PromoCodeDto>> GetAllPromoCodesAsync()
    {
        return await _context.PromoCodes
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PromoCodeDto
            {
                Id = p.Id,
                Code = p.Code,
                DiscountPercentage = p.DiscountPercentage,
                MaxDiscountAmount = p.MaxDiscountAmount,
                ValidFrom = p.ValidFrom,
                ValidUntil = p.ValidUntil,
                MaxUsageCount = p.MaxUsageCount,
                CurrentUsageCount = p.CurrentUsageCount,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<PromoCodeDto> CreatePromoCodeAsync(CreatePromoCodeRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code))
            throw new ArgumentException("Promo code cannot be empty.");

        var normalizedCode = dto.Code.Trim().ToUpperInvariant();
        var exists = await _context.PromoCodes.AnyAsync(p => p.Code.ToUpper() == normalizedCode);
        if (exists)
            throw new InvalidOperationException($"Promo code '{normalizedCode}' already exists.");

        var promo = new PromoCode
        {
            Code = normalizedCode,
            DiscountPercentage = Math.Clamp(dto.DiscountPercentage, 1m, 100m),
            MaxDiscountAmount = dto.MaxDiscountAmount,
            ValidFrom = dto.ValidFrom ?? DateTime.UtcNow,
            ValidUntil = dto.ValidUntil,
            MaxUsageCount = dto.MaxUsageCount > 0 ? dto.MaxUsageCount : 1000,
            CurrentUsageCount = 0,
            IsActive = true
        };

        _context.PromoCodes.Add(promo);
        await _context.SaveChangesAsync();

        return new PromoCodeDto
        {
            Id = promo.Id,
            Code = promo.Code,
            DiscountPercentage = promo.DiscountPercentage,
            MaxDiscountAmount = promo.MaxDiscountAmount,
            ValidFrom = promo.ValidFrom,
            ValidUntil = promo.ValidUntil,
            MaxUsageCount = promo.MaxUsageCount,
            CurrentUsageCount = promo.CurrentUsageCount,
            IsActive = promo.IsActive,
            CreatedAt = promo.CreatedAt
        };
    }

    private static PromoCodeValidationResultDto BuildSuccessfulResult(
        string code,
        decimal discountPercentage,
        decimal? maxDiscount,
        decimal baseAmount)
    {
        decimal discountAmount = 0m;
        if (baseAmount > 0)
        {
            discountAmount = Math.Round(baseAmount * (discountPercentage / 100m), 2);
            if (maxDiscount.HasValue && discountAmount > maxDiscount.Value)
            {
                discountAmount = maxDiscount.Value;
            }
        }

        var finalAmount = Math.Max(0m, baseAmount - discountAmount);

        return new PromoCodeValidationResultDto
        {
            Valid = true,
            Code = code,
            DiscountPercentage = discountPercentage,
            MaxDiscount = maxDiscount,
            DiscountAmount = discountAmount,
            FinalAmount = finalAmount,
            Message = $"Promo code '{code}' applied ({discountPercentage}% off)!"
        };
    }

    private static PromoCodeValidationResultDto BuildFailedResult(string code, decimal baseAmount, string message)
    {
        return new PromoCodeValidationResultDto
        {
            Valid = false,
            Code = code,
            DiscountPercentage = 0,
            MaxDiscount = null,
            DiscountAmount = 0,
            FinalAmount = baseAmount,
            Message = message
        };
    }
}
