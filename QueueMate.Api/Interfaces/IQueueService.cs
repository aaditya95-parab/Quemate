using QueueMate.Api.DTOs.Queue;

namespace QueueMate.Api.Interfaces;

public interface IQueueService
{
    Task<QueueEntryResponse> JoinQueueAsync(
        Guid businessId,
        JoinQueueRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<QueueEntryResponse>> GetLiveQueueAsync(
        Guid userId,
        Guid businessId,
        DateOnly? date,
        CancellationToken cancellationToken = default);

    Task<QueueEntryResponse?> UpdateStatusAsync(
        Guid userId,
        Guid businessId,
        Guid queueEntryId,
        UpdateQueueStatusRequest request,
        CancellationToken cancellationToken = default);

    Task<QueueEntryResponse?> CallNextAsync(
        Guid userId,
        Guid businessId,
        Guid? serviceId,
        CancellationToken cancellationToken = default);

    Task<QueueTrackingResponse?> TrackTokenAsync(
        Guid businessId,
        Guid queueEntryId,
        string customerPhone,
        CancellationToken cancellationToken = default);

    Task<bool> CancelAsync(
        Guid businessId,
        Guid queueEntryId,
        string customerPhone,
        CancellationToken cancellationToken = default);
}