using QueueMate.Api.Models;

namespace QueueMate.Api.Interfaces;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAtUtc) GenerateToken(User user);
}