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
    public ICollection<Service> Services { get; set; }
    = new List<Service>();
    public ICollection<StaffMember> StaffMembers { get; set; }
    = new List<StaffMember>();
    public ICollection<BusinessWorkingHour> WorkingHours { get; set; }
    = new List<BusinessWorkingHour>();
    public ICollection<Appointment> Appointments { get; set; }
    = new List<Appointment>();
    public ICollection<QueueEntry> QueueEntries { get; set; }
    = new List<QueueEntry>();
}