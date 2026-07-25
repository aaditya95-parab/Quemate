using QueueMate.Api.Models.Common;

namespace QueueMate.Api.Models;

public sealed class BusinessWorkingHour : BaseEntity
{
    public Guid BusinessId { get; set; }

    public DayOfWeek DayOfWeek { get; set; }

    public TimeOnly? OpeningTime { get; set; }

    public TimeOnly? ClosingTime { get; set; }

    public bool IsClosed { get; set; }

    public Business Business { get; set; } = null!;
}