using QueueMate.Api.Enums;
using QueueMate.Api.Models.Common;

namespace QueueMate.Api.Models;

public sealed class Appointment : BaseEntity
{
    public Guid BusinessId { get; set; }

    public Guid ServiceId { get; set; }

    public Guid StaffMemberId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerPhone { get; set; } = string.Empty;

    public string? CustomerEmail { get; set; }

    public DateTime StartDateTimeUtc { get; set; }

    public DateTime EndDateTimeUtc { get; set; }

    public AppointmentStatus Status { get; set; }
        = AppointmentStatus.Booked;

    public string? Notes { get; set; }

    public decimal PriceAtBooking { get; set; }

    public Business Business { get; set; } = null!;

    public Service Service { get; set; } = null!;

    public StaffMember StaffMember { get; set; } = null!;
    public QueueEntry? QueueEntry { get; set; }
}