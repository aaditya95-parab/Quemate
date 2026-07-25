namespace QueueMate.Api.DTOs.Queue;

public sealed class QueueUpdatedEvent
{
    public string EventType { get; set; } = string.Empty;

    public Guid BusinessId { get; set; }

    public Guid QueueEntryId { get; set; }

    public string TokenNumber { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime OccurredAtUtc { get; set; }
}