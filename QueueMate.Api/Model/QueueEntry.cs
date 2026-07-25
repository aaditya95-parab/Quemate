using QueueMate.Api.Enums;
using QueueMate.Api.Models.Common;

namespace QueueMate.Api.Models;

public sealed class QueueEntry : BaseEntity
{
    public Guid BusinessId { get; set; }

    public Guid ServiceId { get; set; }

    public Guid? StaffMemberId { get; set; }

    public Guid? AppointmentId { get; set; }

    public string TokenNumber { get; set; } = string.Empty;

    public int DailySequenceNumber { get; set; }

    public DateOnly QueueDate { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerPhone { get; set; } = string.Empty;

    public string? CustomerEmail { get; set; }

    public QueueStatus Status { get; set; } = QueueStatus.Waiting;

    public DateTime JoinedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? CalledAtUtc { get; set; }

    public DateTime? ServiceStartedAtUtc { get; set; }

    public DateTime? CompletedAtUtc { get; set; }

    public string? Notes { get; set; }

    public Business Business { get; set; } = null!;

    public Service Service { get; set; } = null!;

    public StaffMember? StaffMember { get; set; }

    public Appointment? Appointment { get; set; }
}