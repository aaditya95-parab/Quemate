namespace QueueMate.Api.DTOs.Staff;

public sealed class AssignStaffServicesRequest
{
    public List<Guid> ServiceIds { get; set; } = [];
}