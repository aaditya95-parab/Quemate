namespace QueueMate.Api.DTOs.Auth;

public sealed class UserResponse
{
    public Guid Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
}