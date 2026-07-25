namespace QueueMate.Api.DTOs.Appointments;

public sealed class AvailableSlotResponse
{
    public DateTime StartDateTimeUtc { get; set; }

    public DateTime EndDateTimeUtc { get; set; }

    public string LocalStartTime { get; set; } = string.Empty;

    public string LocalEndTime { get; set; } = string.Empty;
}