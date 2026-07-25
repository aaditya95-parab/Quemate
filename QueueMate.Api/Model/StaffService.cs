using QueueMate.Api.Models.Common;

namespace QueueMate.Api.Models;

public sealed class StaffService : BaseEntity
{
    public Guid StaffMemberId { get; set; }

    public Guid ServiceId { get; set; }

    public StaffMember StaffMember { get; set; } = null!;

    public Service Service { get; set; } = null!;
}