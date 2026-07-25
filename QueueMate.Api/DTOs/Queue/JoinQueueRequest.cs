namespace QueueMate.Api.DTOs.Queue;

public sealed class JoinQueueRequest
{
    public Guid ServiceId { get; set; }

    public Guid? StaffMemberId { get; set; }

    public Guid? AppointmentId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerPhone { get; set; } = string.Empty;

    public string? CustomerEmail { get; set; }

    public string? Notes { get; set; }
}