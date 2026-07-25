using QueueMate.Api.Enums;

namespace QueueMate.Api.DTOs.Queue;

public sealed class UpdateQueueStatusRequest
{
    public QueueStatus Status { get; set; }

    public Guid? StaffMemberId { get; set; }
}