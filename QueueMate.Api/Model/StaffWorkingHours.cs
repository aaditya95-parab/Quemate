using QueueMate.Api.Models.Common;

namespace QueueMate.Api.Models;

public sealed class StaffWorkingHour : BaseEntity
{
    public Guid StaffMemberId { get; set; }

    public DayOfWeek DayOfWeek { get; set; }

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    public bool IsAvailable { get; set; } = true;

    public StaffMember StaffMember { get; set; } = null!;
}