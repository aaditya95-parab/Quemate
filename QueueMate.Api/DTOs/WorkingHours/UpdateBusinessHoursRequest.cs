namespace QueueMate.Api.DTOs.WorkingHours;

public sealed class UpdateBusinessHoursRequest
{
    public List<WorkingHourRequest> WorkingHours { get; set; } = [];
}