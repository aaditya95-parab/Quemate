namespace QueueMate.Api.DTOs.Services;

public sealed class UpdateServiceRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int DurationMinutes { get; set; }

    public decimal Price { get; set; }

    public bool IsActive { get; set; }
}