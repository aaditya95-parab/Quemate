namespace QueueMate.Api.DTOs.WorkingHours;

public sealed class WorkingHourResponse
{
    public Guid Id { get; set; }

    public DayOfWeek DayOfWeek { get; set; }

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    public bool IsClosed { get; set; }
}