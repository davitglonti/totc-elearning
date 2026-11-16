using Elearning.Domain.Common;

namespace Elearning.Domain.Entities;

/// <summary>
/// Key-value platform configuration item (e.g., site logo, site title, contact details).
/// </summary>
public class SiteSetting : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
