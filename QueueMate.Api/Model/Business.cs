using QueueMate.Api.Models.Common;

namespace QueueMate.Api.Models;

public sealed class Business : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public string TimeZone { get; set; } = "Asia/Kolkata";

    public bool IsActive { get; set; } = true;

    public ICollection<BusinessMember> Members { get; set; }
        = new List<BusinessMember>();
}