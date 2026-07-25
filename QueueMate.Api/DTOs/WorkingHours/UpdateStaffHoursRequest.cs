namespace QueueMate.Api.DTOs.WorkingHours;

public sealed class UpdateStaffHoursRequest
{
    public List<WorkingHourRequest> WorkingHours { get; set; } = [];
}