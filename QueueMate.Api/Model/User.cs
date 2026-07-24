using QueueMate.Api.Models.Common;

namespace QueueMate.Api.Models;

public sealed class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public ICollection<BusinessMember> BusinessMemberships { get; set; }
        = new List<BusinessMember>();
}