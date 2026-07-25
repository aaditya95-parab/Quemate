using QueueMate.Api.Models.Common;

namespace QueueMate.Api.Models;

public sealed class Service : BaseEntity
{
    public Guid BusinessId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int DurationMinutes { get; set; }

    public decimal Price { get; set; }

    public bool IsActive { get; set; } = true;

    public Business Business { get; set; } = null!;
    public ICollection<StaffService> StaffServices { get; set; }
    = new List<StaffService>();
    public ICollection<Appointment> Appointments { get; set; }
    = new List<Appointment>();
}