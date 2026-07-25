namespace QueueMate.Api.DTOs.Queue;

public sealed class QueueEntryResponse
{
    public Guid Id { get; set; }

    public Guid BusinessId { get; set; }

    public string TokenNumber { get; set; } = string.Empty;

    public int DailySequenceNumber { get; set; }

    public DateOnly QueueDate { get; set; }

    public Guid ServiceId { get; set; }

    public string ServiceName { get; set; } = string.Empty;

    public Guid? StaffMemberId { get; set; }

    public string? StaffName { get; set; }

    public Guid? AppointmentId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerPhone { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime JoinedAtUtc { get; set; }

    public DateTime? CalledAtUtc { get; set; }

    public DateTime? ServiceStartedAtUtc { get; set; }

    public DateTime? CompletedAtUtc { get; set; }
}