namespace Elearning.Domain.Common;

/// <summary>
/// Abstract base entity providing primary key, creation/update timestamps, and soft deletion flags.
/// </summary>
public abstract class BaseEntity : IAuditableEntity, ISoftDeletable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public string ConcurrencyStamp { get; set; } = Guid.NewGuid().ToString("N");
}
