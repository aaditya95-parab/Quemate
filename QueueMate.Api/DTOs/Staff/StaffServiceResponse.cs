namespace QueueMate.Api.DTOs.Staff;

public sealed class StaffServiceResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int DurationMinutes { get; set; }

    public decimal Price { get; set; }

    public bool IsActive { get; set; }
}