using Microsoft.AspNetCore.SignalR;

namespace QueueMate.Api.Hubs;

public sealed class QueueHub : Hub
{
    public Task JoinBusinessGroup(Guid businessId)
    {
        return Groups.AddToGroupAsync(
            Context.ConnectionId,
            GetBusinessGroup(businessId));
    }

    public Task LeaveBusinessGroup(Guid businessId)
    {
        return Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            GetBusinessGroup(businessId));
    }

    public Task JoinTokenGroup(Guid queueEntryId)
    {
        return Groups.AddToGroupAsync(
            Context.ConnectionId,
            GetTokenGroup(queueEntryId));
    }

    public Task LeaveTokenGroup(Guid queueEntryId)
    {
        return Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            GetTokenGroup(queueEntryId));
    }

    public static string GetBusinessGroup(Guid businessId)
    {
        return $"business:{businessId}";
    }

    public static string GetTokenGroup(Guid queueEntryId)
    {
        return $"token:{queueEntryId}";
    }
}