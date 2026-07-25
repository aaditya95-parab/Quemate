namespace QueueMate.Api.DTOs.WorkingHours;

public sealed class StaffTimeOffResponse
{
    public Guid Id { get; set; }

    public Guid StaffMemberId { get; set; }

    public DateTime StartDateTimeUtc { get; set; }

    public DateTime EndDateTimeUtc { get; set; }

    public string? Reason { get; set; }
}