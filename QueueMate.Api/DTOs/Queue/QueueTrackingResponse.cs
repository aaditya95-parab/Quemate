namespace QueueMate.Api.DTOs.Queue;

public sealed class QueueTrackingResponse
{
    public Guid QueueEntryId { get; set; }

    public string TokenNumber { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public int PeopleAhead { get; set; }

    public int EstimatedWaitMinutes { get; set; }

    public string? CurrentlyServingToken { get; set; }

    public string ServiceName { get; set; } = string.Empty;
}