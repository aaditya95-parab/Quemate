using Microsoft.EntityFrameworkCore;
using QueueMate.Api.Data;
using QueueMate.Api.DTOs.WorkingHours;
using QueueMate.Api.Enums;
using QueueMate.Api.Interfaces;
using QueueMate.Api.Models;

namespace QueueMate.Api.Services;

public sealed class WorkingHoursService(
    ApplicationDbContext dbContext) : IWorkingHoursService
{
    public async Task<IReadOnlyList<WorkingHourResponse>>
        GetBusinessHoursAsync(
            Guid userId,
            Guid businessId,
            CancellationToken cancellationToken = default)
    {
        await EnsureBusinessMemberAsync(
            userId,
            businessId,
            cancellationToken);

        return await dbContext.BusinessWorkingHours
            .AsNoTracking()
            .Where(item => item.BusinessId == businessId)
            .OrderBy(item => item.DayOfWeek)
            .Select(item => new WorkingHourResponse
            {
                Id = item.Id,
                DayOfWeek = item.DayOfWeek,
                StartTime = item.OpeningTime,
                EndTime = item.ClosingTime,
                IsClosed = item.IsClosed
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WorkingHourResponse>>
        UpdateBusinessHoursAsync(
            Guid userId,
            Guid businessId,
            UpdateBusinessHoursRequest request,
            CancellationToken cancellationToken = default)
    {
        await EnsureCanManageBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        ValidateWorkingHours(request.WorkingHours);

        var existingHours = await dbContext.BusinessWorkingHours
            .Where(item => item.BusinessId == businessId)
            .ToListAsync(cancellationToken);

        dbContext.BusinessWorkingHours.RemoveRange(existingHours);

        var newHours = request.WorkingHours
            .Select(item => new BusinessWorkingHour
            {
                BusinessId = businessId,
                DayOfWeek = item.DayOfWeek,
                OpeningTime = item.IsClosed ? null : item.StartTime,
                ClosingTime = item.IsClosed ? null : item.EndTime,
                IsClosed = item.IsClosed
            })
            .ToList();

        dbContext.BusinessWorkingHours.AddRange(newHours);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetBusinessHoursAsync(
            userId,
            businessId,
            cancellationToken);
    }

    public async Task<IReadOnlyList<WorkingHourResponse>>
        GetStaffHoursAsync(
            Guid userId,
            Guid businessId,
            Guid staffId,
            CancellationToken cancellationToken = default)
    {
        await EnsureBusinessMemberAsync(
            userId,
            businessId,
            cancellationToken);

        await EnsureStaffExistsAsync(
            businessId,
            staffId,
            cancellationToken);

        return await dbContext.StaffWorkingHours
            .AsNoTracking()
            .Where(item => item.StaffMemberId == staffId)
            .OrderBy(item => item.DayOfWeek)
            .Select(item => new WorkingHourResponse
            {
                Id = item.Id,
                DayOfWeek = item.DayOfWeek,
                StartTime = item.StartTime,
                EndTime = item.EndTime,
                IsClosed = !item.IsAvailable
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WorkingHourResponse>>
        UpdateStaffHoursAsync(
            Guid userId,
            Guid businessId,
            Guid staffId,
            UpdateStaffHoursRequest request,
            CancellationToken cancellationToken = default)
    {
        await EnsureCanManageBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        await EnsureStaffExistsAsync(
            businessId,
            staffId,
            cancellationToken);

        ValidateWorkingHours(request.WorkingHours);

        var businessHours = await dbContext.BusinessWorkingHours
            .AsNoTracking()
            .Where(item => item.BusinessId == businessId)
            .ToDictionaryAsync(
                item => item.DayOfWeek,
                cancellationToken);

        ValidateStaffHoursAgainstBusinessHours(
            request.WorkingHours,
            businessHours);

        var existingHours = await dbContext.StaffWorkingHours
            .Where(item => item.StaffMemberId == staffId)
            .ToListAsync(cancellationToken);

        dbContext.StaffWorkingHours.RemoveRange(existingHours);

        var newHours = request.WorkingHours
            .Select(item => new StaffWorkingHour
            {
                StaffMemberId = staffId,
                DayOfWeek = item.DayOfWeek,
                StartTime = item.IsClosed ? null : item.StartTime,
                EndTime = item.IsClosed ? null : item.EndTime,
                IsAvailable = !item.IsClosed
            })
            .ToList();

        dbContext.StaffWorkingHours.AddRange(newHours);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetStaffHoursAsync(
            userId,
            businessId,
            staffId,
            cancellationToken);
    }

    public async Task<IReadOnlyList<StaffTimeOffResponse>>
        GetStaffTimeOffAsync(
            Guid userId,
            Guid businessId,
            Guid staffId,
            CancellationToken cancellationToken = default)
    {
        await EnsureBusinessMemberAsync(
            userId,
            businessId,
            cancellationToken);

        await EnsureStaffExistsAsync(
            businessId,
            staffId,
            cancellationToken);

        return await dbContext.StaffTimeOffEntries
            .AsNoTracking()
            .Where(item => item.StaffMemberId == staffId)
            .OrderBy(item => item.StartDateTimeUtc)
            .Select(item => new StaffTimeOffResponse
            {
                Id = item.Id,
                StaffMemberId = item.StaffMemberId,
                StartDateTimeUtc = item.StartDateTimeUtc,
                EndDateTimeUtc = item.EndDateTimeUtc,
                Reason = item.Reason
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<StaffTimeOffResponse>
        CreateStaffTimeOffAsync(
            Guid userId,
            Guid businessId,
            Guid staffId,
            CreateStaffTimeOffRequest request,
            CancellationToken cancellationToken = default)
    {
        await EnsureCanManageBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        await EnsureStaffExistsAsync(
            businessId,
            staffId,
            cancellationToken);

        if (request.StartDateTimeUtc.Kind != DateTimeKind.Utc ||
            request.EndDateTimeUtc.Kind != DateTimeKind.Utc)
        {
            throw new ArgumentException(
                "Start and end date/time must be provided in UTC.");
        }

        if (request.EndDateTimeUtc <= request.StartDateTimeUtc)
        {
            throw new ArgumentException(
                "Time-off end must be after the start.");
        }

        var overlaps = await dbContext.StaffTimeOffEntries
            .AnyAsync(
                item =>
                    item.StaffMemberId == staffId &&
                    request.StartDateTimeUtc < item.EndDateTimeUtc &&
                    request.EndDateTimeUtc > item.StartDateTimeUtc,
                cancellationToken);

        if (overlaps)
        {
            throw new InvalidOperationException(
                "This time-off period overlaps an existing entry.");
        }

        var timeOff = new StaffTimeOff
        {
            StaffMemberId = staffId,
            StartDateTimeUtc = request.StartDateTimeUtc,
            EndDateTimeUtc = request.EndDateTimeUtc,
            Reason = CleanOptionalValue(request.Reason)
        };

        dbContext.StaffTimeOffEntries.Add(timeOff);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new StaffTimeOffResponse
        {
            Id = timeOff.Id,
            StaffMemberId = timeOff.StaffMemberId,
            StartDateTimeUtc = timeOff.StartDateTimeUtc,
            EndDateTimeUtc = timeOff.EndDateTimeUtc,
            Reason = timeOff.Reason
        };
    }

    public async Task<bool> DeleteStaffTimeOffAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        Guid timeOffId,
        CancellationToken cancellationToken = default)
    {
        await EnsureCanManageBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        await EnsureStaffExistsAsync(
            businessId,
            staffId,
            cancellationToken);

        var timeOff = await dbContext.StaffTimeOffEntries
            .SingleOrDefaultAsync(
                item =>
                    item.Id == timeOffId &&
                    item.StaffMemberId == staffId,
                cancellationToken);

        if (timeOff is null)
        {
            return false;
        }

        dbContext.StaffTimeOffEntries.Remove(timeOff);
        await dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task EnsureBusinessMemberAsync(
        Guid userId,
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var hasAccess = await dbContext.BusinessMembers
            .AnyAsync(
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

    private async Task EnsureCanManageBusinessAsync(
        Guid userId,
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var role = await dbContext.BusinessMembers
            .AsNoTracking()
            .Where(member =>
                member.UserId == userId &&
                member.BusinessId == businessId &&
                member.IsActive &&
                member.Business.IsActive)
            .Select(member => (BusinessRole?)member.Role)
            .SingleOrDefaultAsync(cancellationToken);

        if (role is null)
        {
            throw new UnauthorizedAccessException(
                "You do not have access to this business.");
        }

        if (role is not BusinessRole.Owner
            and not BusinessRole.Manager)
        {
            throw new UnauthorizedAccessException(
                "Only owners and managers can manage schedules.");
        }
    }

    private async Task EnsureStaffExistsAsync(
        Guid businessId,
        Guid staffId,
        CancellationToken cancellationToken)
    {
        var exists = await dbContext.StaffMembers
            .AnyAsync(
                staff =>
                    staff.Id == staffId &&
                    staff.BusinessId == businessId &&
                    staff.IsActive,
                cancellationToken);

        if (!exists)
        {
            throw new KeyNotFoundException(
                "Staff member was not found.");
        }
    }

    private static void ValidateWorkingHours(
        IReadOnlyCollection<WorkingHourRequest>? hours)
    {
        if (hours is null || hours.Count == 0)
        {
            throw new ArgumentException(
                "At least one working-hour entry is required.");
        }

        var duplicateDays = hours
            .GroupBy(item => item.DayOfWeek)
            .Any(group => group.Count() > 1);

        if (duplicateDays)
        {
            throw new ArgumentException(
                "Each day of the week can appear only once.");
        }

        foreach (var item in hours)
        {
            if (item.IsClosed)
            {
                if (item.StartTime is not null ||
                    item.EndTime is not null)
                {
                    throw new ArgumentException(
                        $"{item.DayOfWeek}: closed days must not contain times.");
                }

                continue;
            }

            if (item.StartTime is null || item.EndTime is null)
            {
                throw new ArgumentException(
                    $"{item.DayOfWeek}: start and end times are required.");
            }

            if (item.StartTime >= item.EndTime)
            {
                throw new ArgumentException(
                    $"{item.DayOfWeek}: start time must be before end time.");
            }
        }
    }

    private static void ValidateStaffHoursAgainstBusinessHours(
        IEnumerable<WorkingHourRequest> staffHours,
        IReadOnlyDictionary<DayOfWeek, BusinessWorkingHour> businessHours)
    {
        foreach (var staffHour in staffHours)
        {
            if (staffHour.IsClosed)
            {
                continue;
            }

            if (!businessHours.TryGetValue(
                    staffHour.DayOfWeek,
                    out var businessHour))
            {
                throw new ArgumentException(
                    $"Business hours are not configured for {staffHour.DayOfWeek}.");
            }

            if (businessHour.IsClosed)
            {
                throw new ArgumentException(
                    $"Staff cannot work on {staffHour.DayOfWeek} because the business is closed.");
            }

            if (staffHour.StartTime < businessHour.OpeningTime ||
                staffHour.EndTime > businessHour.ClosingTime)
            {
                throw new ArgumentException(
                    $"{staffHour.DayOfWeek}: staff hours must remain inside business hours.");
            }
        }
    }

    private static string? CleanOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}