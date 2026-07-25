using QueueMate.Api.Models.Common;

namespace QueueMate.Api.Models;

public sealed class StaffTimeOff : BaseEntity
{
    public Guid StaffMemberId { get; set; }

    public DateTime StartDateTimeUtc { get; set; }

    public DateTime EndDateTimeUtc { get; set; }

    public string? Reason { get; set; }

    public StaffMember StaffMember { get; set; } = null!;
}