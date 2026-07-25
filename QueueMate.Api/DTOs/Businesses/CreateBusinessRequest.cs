namespace QueueMate.Api.DTOs.Businesses;

public sealed class CreateBusinessRequest
{
    public string Name { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public string TimeZone { get; set; } = "Asia/Kolkata";
}