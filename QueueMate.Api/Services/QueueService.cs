using Microsoft.EntityFrameworkCore;
using QueueMate.Api.Data;
using QueueMate.Api.DTOs.Queue;
using QueueMate.Api.Enums;
using QueueMate.Api.Interfaces;
using QueueMate.Api.Models;

namespace QueueMate.Api.Services;

public sealed class QueueService(
    ApplicationDbContext dbContext) : IQueueService
{
    public async Task<QueueEntryResponse> JoinQueueAsync(
        Guid businessId,
        JoinQueueRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateJoinRequest(request);

        var business = await dbContext.Businesses
            .AsNoTracking()
            .SingleOrDefaultAsync(
                item => item.Id == businessId && item.IsActive,
                cancellationToken)
            ?? throw new KeyNotFoundException("Business was not found.");

        var service = await dbContext.Services
            .AsNoTracking()
            .SingleOrDefaultAsync(
                item =>
                    item.Id == request.ServiceId &&
                    item.BusinessId == businessId &&
                    item.IsActive,
                cancellationToken)
            ?? throw new KeyNotFoundException("Service was not found.");

        if (request.StaffMemberId.HasValue)
        {
            var staffCanProvideService =
                await dbContext.StaffServices.AnyAsync(
                    item =>
                        item.StaffMemberId == request.StaffMemberId &&
                        item.ServiceId == request.ServiceId &&
                        item.StaffMember.BusinessId == businessId &&
                        item.StaffMember.IsActive,
                    cancellationToken);

            if (!staffCanProvideService)
            {
                throw new ArgumentException(
                    "The selected staff member does not provide this service.");
            }
        }

        Appointment? appointment = null;

        if (request.AppointmentId.HasValue)
        {
            appointment = await dbContext.Appointments
                .SingleOrDefaultAsync(
                    item =>
                        item.Id == request.AppointmentId &&
                        item.BusinessId == businessId,
                    cancellationToken)
                ?? throw new KeyNotFoundException(
                    "Appointment was not found.");

            var alreadyCheckedIn =
                await dbContext.QueueEntries.AnyAsync(
                    item => item.AppointmentId == appointment.Id,
                    cancellationToken);

            if (alreadyCheckedIn)
            {
                throw new InvalidOperationException(
                    "This appointment has already joined the queue.");
            }

            appointment.Status = AppointmentStatus.CheckedIn;
        }

        var queueDate = GetBusinessLocalDate(business.TimeZone);

        var lastSequence = await dbContext.QueueEntries
            .Where(item =>
                item.BusinessId == businessId &&
                item.QueueDate == queueDate)
            .MaxAsync(
                item => (int?)item.DailySequenceNumber,
                cancellationToken) ?? 0;

        var sequence = lastSequence + 1;

        var queueEntry = new QueueEntry
        {
            BusinessId = businessId,
            ServiceId = request.ServiceId,
            StaffMemberId = request.StaffMemberId,
            AppointmentId = request.AppointmentId,
            QueueDate = queueDate,
            DailySequenceNumber = sequence,
            TokenNumber = $"A-{sequence:000}",
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            CustomerEmail = CleanOptionalValue(request.CustomerEmail)
                ?.ToLowerInvariant(),
            Notes = CleanOptionalValue(request.Notes),
            Status = QueueStatus.Waiting,
            JoinedAtUtc = DateTime.UtcNow
        };

        dbContext.QueueEntries.Add(queueEntry);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetResponseAsync(
                   queueEntry.Id,
                   cancellationToken)
               ?? throw new InvalidOperationException(
                   "Queue entry was created but could not be loaded.");
    }

    public async Task<IReadOnlyList<QueueEntryResponse>> GetLiveQueueAsync(
        Guid userId,
        Guid businessId,
        DateOnly? date,
        CancellationToken cancellationToken = default)
    {
        await EnsureBusinessMemberAsync(
            userId,
            businessId,
            cancellationToken);

        var queueDate = date ?? await GetCurrentBusinessDateAsync(
            businessId,
            cancellationToken);

        return await dbContext.QueueEntries
            .AsNoTracking()
            .Where(item =>
                item.BusinessId == businessId &&
                item.QueueDate == queueDate)
            .OrderBy(item => item.DailySequenceNumber)
            .Select(item => MapResponse(item))
            .ToListAsync(cancellationToken);
    }

    public async Task<QueueEntryResponse?> UpdateStatusAsync(
        Guid userId,
        Guid businessId,
        Guid queueEntryId,
        UpdateQueueStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureBusinessMemberAsync(
            userId,
            businessId,
            cancellationToken);

        var entry = await dbContext.QueueEntries
            .SingleOrDefaultAsync(
                item =>
                    item.Id == queueEntryId &&
                    item.BusinessId == businessId,
                cancellationToken);

        if (entry is null)
        {
            return null;
        }

        if (request.StaffMemberId.HasValue)
        {
            var staffExists = await dbContext.StaffMembers.AnyAsync(
                staff =>
                    staff.Id == request.StaffMemberId &&
                    staff.BusinessId == businessId &&
                    staff.IsActive,
                cancellationToken);

            if (!staffExists)
            {
                throw new ArgumentException(
                    "Selected staff member was not found.");
            }

            entry.StaffMemberId = request.StaffMemberId;
        }

        ApplyStatus(entry, request.Status);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetResponseAsync(
            entry.Id,
            cancellationToken);
    }

    public async Task<QueueEntryResponse?> CallNextAsync(
        Guid userId,
        Guid businessId,
        Guid? serviceId,
        CancellationToken cancellationToken = default)
    {
        await EnsureBusinessMemberAsync(
            userId,
            businessId,
            cancellationToken);

        var queueDate = await GetCurrentBusinessDateAsync(
            businessId,
            cancellationToken);

        var query = dbContext.QueueEntries
            .Where(item =>
                item.BusinessId == businessId &&
                item.QueueDate == queueDate &&
                item.Status == QueueStatus.Waiting);

        if (serviceId.HasValue)
        {
            query = query.Where(item =>
                item.ServiceId == serviceId.Value);
        }

        var nextEntry = await query
            .OrderBy(item => item.DailySequenceNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (nextEntry is null)
        {
            return null;
        }

        ApplyStatus(nextEntry, QueueStatus.Called);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetResponseAsync(
            nextEntry.Id,
            cancellationToken);
    }

    public async Task<QueueTrackingResponse?> TrackTokenAsync(
        Guid businessId,
        Guid queueEntryId,
        string customerPhone,
        CancellationToken cancellationToken = default)
    {
        var phone = customerPhone.Trim();

        var entry = await dbContext.QueueEntries
            .AsNoTracking()
            .Include(item => item.Service)
            .SingleOrDefaultAsync(
                item =>
                    item.Id == queueEntryId &&
                    item.BusinessId == businessId &&
                    item.CustomerPhone == phone,
                cancellationToken);

        if (entry is null)
        {
            return null;
        }

        var peopleAhead = 0;

        if (entry.Status == QueueStatus.Waiting)
        {
            peopleAhead = await dbContext.QueueEntries.CountAsync(
                item =>
                    item.BusinessId == businessId &&
                    item.QueueDate == entry.QueueDate &&
                    item.Status == QueueStatus.Waiting &&
                    item.DailySequenceNumber <
                    entry.DailySequenceNumber,
                cancellationToken);
        }

        var currentlyServingToken = await dbContext.QueueEntries
            .AsNoTracking()
            .Where(item =>
                item.BusinessId == businessId &&
                item.QueueDate == entry.QueueDate &&
                item.Status == QueueStatus.Serving)
            .OrderBy(item => item.ServiceStartedAtUtc)
            .Select(item => item.TokenNumber)
            .FirstOrDefaultAsync(cancellationToken);

        return new QueueTrackingResponse
        {
            QueueEntryId = entry.Id,
            TokenNumber = entry.TokenNumber,
            Status = entry.Status.ToString(),
            PeopleAhead = peopleAhead,
            EstimatedWaitMinutes =
                peopleAhead * entry.Service.DurationMinutes,
            CurrentlyServingToken = currentlyServingToken,
            ServiceName = entry.Service.Name
        };
    }

    public async Task<bool> CancelAsync(
        Guid businessId,
        Guid queueEntryId,
        string customerPhone,
        CancellationToken cancellationToken = default)
    {
        var phone = customerPhone.Trim();

        var entry = await dbContext.QueueEntries
            .SingleOrDefaultAsync(
                item =>
                    item.Id == queueEntryId &&
                    item.BusinessId == businessId &&
                    item.CustomerPhone == phone,
                cancellationToken);

        if (entry is null)
        {
            return false;
        }

        if (entry.Status is
            QueueStatus.Serving or
            QueueStatus.Completed or
            QueueStatus.Cancelled)
        {
            throw new InvalidOperationException(
                "This queue entry cannot be cancelled.");
        }

        ApplyStatus(entry, QueueStatus.Cancelled);

        await dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task<QueueEntryResponse?> GetResponseAsync(
        Guid queueEntryId,
        CancellationToken cancellationToken)
    {
        return await dbContext.QueueEntries
            .AsNoTracking()
            .Where(item => item.Id == queueEntryId)
            .Select(item => MapResponse(item))
            .SingleOrDefaultAsync(cancellationToken);
    }

    private static QueueEntryResponse MapResponse(QueueEntry item)
    {
        return new QueueEntryResponse
        {
            Id = item.Id,
            BusinessId = item.BusinessId,
            TokenNumber = item.TokenNumber,
            DailySequenceNumber = item.DailySequenceNumber,
            QueueDate = item.QueueDate,
            ServiceId = item.ServiceId,
            ServiceName = item.Service.Name,
            StaffMemberId = item.StaffMemberId,
            StaffName = item.StaffMember == null
                ? null
                : item.StaffMember.FullName,
            AppointmentId = item.AppointmentId,
            CustomerName = item.CustomerName,
            CustomerPhone = item.CustomerPhone,
            Status = item.Status.ToString(),
            JoinedAtUtc = item.JoinedAtUtc,
            CalledAtUtc = item.CalledAtUtc,
            ServiceStartedAtUtc = item.ServiceStartedAtUtc,
            CompletedAtUtc = item.CompletedAtUtc
        };
    }

    private static void ApplyStatus(
        QueueEntry entry,
        QueueStatus status)
    {
        entry.Status = status;

        switch (status)
        {
            case QueueStatus.Called:
                entry.CalledAtUtc = DateTime.UtcNow;
                break;

            case QueueStatus.Serving:
                entry.ServiceStartedAtUtc = DateTime.UtcNow;
                break;

            case QueueStatus.Completed:
                entry.CompletedAtUtc = DateTime.UtcNow;
                break;
        }
    }

    private async Task EnsureBusinessMemberAsync(
        Guid userId,
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var hasAccess = await dbContext.BusinessMembers.AnyAsync(
            member =>
                member.UserId == userId &&
                member.BusinessId == businessId &&
                member.IsActive &&
                member.Business.IsActive,
            cancellationToken);

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException(
                "You do not have access to this business.");
        }
    }

    private async Task<DateOnly> GetCurrentBusinessDateAsync(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var timeZoneId = await dbContext.Businesses
            .Where(item => item.Id == businessId)
            .Select(item => item.TimeZone)
            .SingleAsync(cancellationToken);

        return GetBusinessLocalDate(timeZoneId);
    }

    private static DateOnly GetBusinessLocalDate(
        string timeZoneId)
    {
        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(
            timeZoneId);

        var localNow = TimeZoneInfo.ConvertTimeFromUtc(
            DateTime.UtcNow,
            timeZone);

        return DateOnly.FromDateTime(localNow);
    }

    private static void ValidateJoinRequest(
        JoinQueueRequest request)
    {
        if (request.ServiceId == Guid.Empty)
        {
            throw new ArgumentException(
                "Service is required.");
        }

        if (string.IsNullOrWhiteSpace(request.CustomerName))
        {
            throw new ArgumentException(
                "Customer name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
        {
            throw new ArgumentException(
                "Customer phone is required.");
        }
    }

    private static string? CleanOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}