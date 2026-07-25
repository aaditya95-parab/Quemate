using QueueMate.Api.Models.Common;

namespace QueueMate.Api.Models;

public sealed class StaffMember : BaseEntity
{
    public Guid BusinessId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? JobTitle { get; set; }

    public bool IsActive { get; set; } = true;

    public Business Business { get; set; } = null!;

    public ICollection<StaffService> StaffServices { get; set; }
        = new List<StaffService>();
    public ICollection<StaffWorkingHour> WorkingHours { get; set; }
    = new List<StaffWorkingHour>();

    public ICollection<StaffTimeOff> TimeOffEntries { get; set; }
    = new List<StaffTimeOff>();
}