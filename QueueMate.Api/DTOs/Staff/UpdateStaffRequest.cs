namespace QueueMate.Api.DTOs.Staff;

public sealed class UpdateStaffRequest
{
    public string FullName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? JobTitle { get; set; }

    public bool IsActive { get; set; }
}