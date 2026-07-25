namespace QueueMate.Api.DTOs.Appointments;

public sealed class CreateAppointmentRequest
{
    public Guid ServiceId { get; set; }

    public Guid StaffMemberId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerPhone { get; set; } = string.Empty;

    public string? CustomerEmail { get; set; }

    public DateTime StartDateTimeUtc { get; set; }

    public string? Notes { get; set; }
}
