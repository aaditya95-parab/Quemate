namespace QueueMate.Api.Enums;

public enum QueueStatus
{
    Waiting = 1,
    Called = 2,
    Serving = 3,
    Completed = 4,
    Cancelled = 5,
    NoShow = 6
}