namespace Elearning.Application.DTOs;

/// <summary>
/// Request payload to validate a promotional discount code.
/// </summary>
public class ValidatePromoCodeRequestDto
{
    public string Code { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
    public Guid? CourseId { get; set; }
}

/// <summary>
/// Result returned when validating a promotional code.
/// Compatible with frontend checkout calculations.
/// </summary>
public class PromoCodeValidationResultDto
{
    public bool Valid { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public decimal? MaxDiscount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Detailed promo code representation for management and administrative queries.
/// </summary>
public class PromoCodeDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public int MaxUsageCount { get; set; }
    public int CurrentUsageCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Request payload for creating a new promotional discount code.
/// </summary>
public class CreatePromoCodeRequestDto
{
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public int MaxUsageCount { get; set; } = 1000;
}
