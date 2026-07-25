namespace QueueMate.Api.DTOs.WorkingHours;

public sealed class CreateStaffTimeOffRequest
{
    public DateTime StartDateTimeUtc { get; set; }

    public DateTime EndDateTimeUtc { get; set; }

    public string? Reason { get; set; }
}