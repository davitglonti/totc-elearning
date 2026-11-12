using Elearning.Domain.Common;

namespace Elearning.Domain.Entities;

/// <summary>
/// Represents a promotional discount code for course purchases and checkouts.
/// </summary>
public class PromoCode : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime ValidFrom { get; set; } = DateTime.UtcNow;
    public DateTime? ValidUntil { get; set; }
    public int MaxUsageCount { get; set; } = 1000;
    public int CurrentUsageCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}
