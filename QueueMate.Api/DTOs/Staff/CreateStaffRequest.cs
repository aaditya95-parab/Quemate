namespace QueueMate.Api.DTOs.Staff;

public sealed class CreateStaffRequest
{
    public string FullName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? JobTitle { get; set; }

    public List<Guid> ServiceIds { get; set; } = [];
}