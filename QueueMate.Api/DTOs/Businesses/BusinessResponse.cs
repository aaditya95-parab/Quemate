namespace QueueMate.Api.DTOs.Businesses;

public sealed class BusinessResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public string TimeZone { get; set; } = string.Empty;

    public string CurrentUserRole { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; }
}