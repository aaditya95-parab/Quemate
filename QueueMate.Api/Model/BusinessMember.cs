using QueueMate.Api.Enums;
using QueueMate.Api.Models.Common;

namespace QueueMate.Api.Models;

public sealed class BusinessMember : BaseEntity
{
    public Guid UserId { get; set; }

    public Guid BusinessId { get; set; }

    public BusinessRole Role { get; set; } = BusinessRole.Staff;

    public bool IsActive { get; set; } = true;

    public User User { get; set; } = null!;

    public Business Business { get; set; } = null!;
}