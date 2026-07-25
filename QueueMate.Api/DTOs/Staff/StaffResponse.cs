namespace QueueMate.Api.DTOs.Staff;

public sealed class StaffResponse
{
    public Guid Id { get; set; }

    public Guid BusinessId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? JobTitle { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }

    public List<StaffServiceResponse> Services { get; set; } = [];
}