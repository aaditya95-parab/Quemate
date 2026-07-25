namespace QueueMate.Api.Helpers;

public static class TimeZoneResolver
{
    private static readonly IReadOnlyDictionary<string, string> WindowsFallbacks =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["Asia/Kolkata"] = "India Standard Time",
            ["Asia/Calcutta"] = "India Standard Time",
            ["UTC"] = "UTC"
        };

    public static TimeZoneInfo Resolve(string timeZoneId)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        }
        catch (TimeZoneNotFoundException)
        {
            if (WindowsFallbacks.TryGetValue(timeZoneId, out var fallbackId))
            {
                return TimeZoneInfo.FindSystemTimeZoneById(fallbackId);
            }

            throw new InvalidOperationException(
                $"The configured time zone '{timeZoneId}' is invalid.");
        }
        catch (InvalidTimeZoneException)
        {
            throw new InvalidOperationException(
                $"The configured time zone '{timeZoneId}' is invalid.");
        }
    }
}
