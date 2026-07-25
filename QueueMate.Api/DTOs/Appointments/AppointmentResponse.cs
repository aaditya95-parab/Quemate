namespace QueueMate.Api.DTOs.Appointments;

public sealed class AppointmentResponse
{
    public Guid Id { get; set; }

    public Guid BusinessId { get; set; }

    public Guid ServiceId { get; set; }

    public string ServiceName { get; set; } = string.Empty;

    public Guid StaffMemberId { get; set; }

    public string StaffName { get; set; } = string.Empty;

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerPhone { get; set; } = string.Empty;

    public string? CustomerEmail { get; set; }

    public DateTime StartDateTimeUtc { get; set; }

    public DateTime EndDateTimeUtc { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }

    public decimal PriceAtBooking { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
