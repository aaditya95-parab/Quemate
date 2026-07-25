using Microsoft.EntityFrameworkCore;
using QueueMate.Api.Data;
using QueueMate.Api.DTOs.Appointments;
using QueueMate.Api.Enums;
using QueueMate.Api.Interfaces;
using QueueMate.Api.Models;

namespace QueueMate.Api.Services;

public sealed class AppointmentService(
    ApplicationDbContext dbContext) : IAppointmentService
{
    private const int SlotIntervalMinutes = 15;

    public async Task<IReadOnlyList<AvailableSlotResponse>>
        GetAvailableSlotsAsync(
            Guid businessId,
            Guid serviceId,
            Guid staffId,
            DateOnly date,
            CancellationToken cancellationToken = default)
    {
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
                    item.Id == serviceId &&
                    item.BusinessId == businessId &&
                    item.IsActive,
                cancellationToken)
            ?? throw new KeyNotFoundException("Service was not found.");

        var staffCanProvideService =
            await dbContext.StaffServices.AnyAsync(
                item =>
                    item.StaffMemberId == staffId &&
                    item.ServiceId == serviceId &&
                    item.StaffMember.BusinessId == businessId &&
                    item.StaffMember.IsActive,
                cancellationToken);

        if (!staffCanProvideService)
        {
            throw new ArgumentException(
                "The selected staff member does not provide this service.");
        }

        var dayOfWeek = date.DayOfWeek;

        var businessHour = await dbContext.BusinessWorkingHours
            .AsNoTracking()
            .SingleOrDefaultAsync(
                item =>
                    item.BusinessId == businessId &&
                    item.DayOfWeek == dayOfWeek,
                cancellationToken);

        if (businessHour is null ||
            businessHour.IsClosed ||
            businessHour.OpeningTime is null ||
            businessHour.ClosingTime is null)
        {
            return [];
        }

        var staffHour = await dbContext.StaffWorkingHours
            .AsNoTracking()
            .SingleOrDefaultAsync(
                item =>
                    item.StaffMemberId == staffId &&
                    item.DayOfWeek == dayOfWeek,
                cancellationToken);

        if (staffHour is null ||
            !staffHour.IsAvailable ||
            staffHour.StartTime is null ||
            staffHour.EndTime is null)
        {
            return [];
        }

        var timeZone = ResolveTimeZone(business.TimeZone);

        var localScheduleStart = date.ToDateTime(staffHour.StartTime.Value);
        var localScheduleEnd = date.ToDateTime(staffHour.EndTime.Value);

        var scheduleStartUtc = TimeZoneInfo.ConvertTimeToUtc(
            localScheduleStart,
            timeZone);

        var scheduleEndUtc = TimeZoneInfo.ConvertTimeToUtc(
            localScheduleEnd,
            timeZone);

        var existingAppointments = await dbContext.Appointments
            .AsNoTracking()
            .Where(item =>
                item.StaffMemberId == staffId &&
                item.Status != AppointmentStatus.Cancelled &&
                item.StartDateTimeUtc < scheduleEndUtc &&
                item.EndDateTimeUtc > scheduleStartUtc)
            .Select(item => new
            {
                item.StartDateTimeUtc,
                item.EndDateTimeUtc
            })
            .ToListAsync(cancellationToken);

        var timeOffEntries = await dbContext.StaffTimeOffEntries
            .AsNoTracking()
            .Where(item =>
                item.StaffMemberId == staffId &&
                item.StartDateTimeUtc < scheduleEndUtc &&
                item.EndDateTimeUtc > scheduleStartUtc)
            .Select(item => new
            {
                item.StartDateTimeUtc,
                item.EndDateTimeUtc
            })
            .ToListAsync(cancellationToken);

        var result = new List<AvailableSlotResponse>();

        var currentLocal = localScheduleStart;

        while (currentLocal.AddMinutes(service.DurationMinutes)
               <= localScheduleEnd)
        {
            var slotEndLocal =
                currentLocal.AddMinutes(service.DurationMinutes);

            var slotStartUtc = TimeZoneInfo.ConvertTimeToUtc(
                currentLocal,
                timeZone);

            var slotEndUtc = TimeZoneInfo.ConvertTimeToUtc(
                slotEndLocal,
                timeZone);

            var overlapsAppointment = existingAppointments.Any(item =>
                slotStartUtc < item.EndDateTimeUtc &&
                slotEndUtc > item.StartDateTimeUtc);

            var overlapsTimeOff = timeOffEntries.Any(item =>
                slotStartUtc < item.EndDateTimeUtc &&
                slotEndUtc > item.StartDateTimeUtc);

            var isPast = slotStartUtc <= DateTime.UtcNow;

            if (!overlapsAppointment &&
                !overlapsTimeOff &&
                !isPast)
            {
                result.Add(new AvailableSlotResponse
                {
                    StartDateTimeUtc = slotStartUtc,
                    EndDateTimeUtc = slotEndUtc,
                    LocalStartTime = currentLocal.ToString("hh:mm tt"),
                    LocalEndTime = slotEndLocal.ToString("hh:mm tt")
                });
            }

            currentLocal = currentLocal.AddMinutes(
                SlotIntervalMinutes);
        }

        return result;
    }

    public async Task<AppointmentResponse> CreateAsync(
        Guid businessId,
        CreateAppointmentRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateCreateRequest(request);

        var service = await dbContext.Services
            .AsNoTracking()
            .SingleOrDefaultAsync(
                item =>
                    item.Id == request.ServiceId &&
                    item.BusinessId == businessId &&
                    item.IsActive,
                cancellationToken)
            ?? throw new KeyNotFoundException("Service was not found.");

        var validStaffService = await dbContext.StaffServices
            .AnyAsync(
                item =>
                    item.StaffMemberId == request.StaffMemberId &&
                    item.ServiceId == request.ServiceId &&
                    item.StaffMember.BusinessId == businessId &&
                    item.StaffMember.IsActive,
                cancellationToken);

        if (!validStaffService)
        {
            throw new ArgumentException(
                "The selected staff member does not provide this service.");
        }

        var startUtc = request.StartDateTimeUtc.ToUniversalTime();
        var endUtc = startUtc.AddMinutes(service.DurationMinutes);

        if (startUtc <= DateTime.UtcNow)
        {
            throw new ArgumentException(
                "Appointments cannot be booked in the past.");
        }

        var conflictExists = await dbContext.Appointments.AnyAsync(
            item =>
                item.StaffMemberId == request.StaffMemberId &&
                item.Status != AppointmentStatus.Cancelled &&
                startUtc < item.EndDateTimeUtc &&
                endUtc > item.StartDateTimeUtc,
            cancellationToken);

        if (conflictExists)
        {
            throw new InvalidOperationException(
                "This appointment slot is no longer available.");
        }

        var timeOffConflict = await dbContext.StaffTimeOffEntries.AnyAsync(
            item =>
                item.StaffMemberId == request.StaffMemberId &&
                startUtc < item.EndDateTimeUtc &&
                endUtc > item.StartDateTimeUtc,
            cancellationToken);

        if (timeOffConflict)
        {
            throw new InvalidOperationException(
                "The selected staff member is unavailable during this time.");
        }

        var appointment = new Appointment
        {
            BusinessId = businessId,
            ServiceId = request.ServiceId,
            StaffMemberId = request.StaffMemberId,
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            CustomerEmail = CleanOptionalValue(request.CustomerEmail)
                ?.ToLowerInvariant(),
            StartDateTimeUtc = startUtc,
            EndDateTimeUtc = endUtc,
            Notes = CleanOptionalValue(request.Notes),
            PriceAtBooking = service.Price,
            Status = AppointmentStatus.Booked
        };

        dbContext.Appointments.Add(appointment);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetAppointmentResponseAsync(
                   appointment.Id,
                   cancellationToken)
               ?? throw new InvalidOperationException(
                   "Appointment was created but could not be loaded.");
    }

    public async Task<IReadOnlyList<AppointmentResponse>>
        GetBusinessAppointmentsAsync(
            Guid userId,
            Guid businessId,
            DateOnly? date,
            CancellationToken cancellationToken = default)
    {
        await EnsureBusinessMemberAsync(
            userId,
            businessId,
            cancellationToken);

        var query = dbContext.Appointments
            .AsNoTracking()
            .Where(item => item.BusinessId == businessId);

        if (date.HasValue)
        {
            var business = await dbContext.Businesses
                .AsNoTracking()
                .SingleAsync(
                    item => item.Id == businessId,
                    cancellationToken);

            var timeZone = ResolveTimeZone(business.TimeZone);

            var localStart = date.Value.ToDateTime(TimeOnly.MinValue);
            var localEnd = localStart.AddDays(1);

            var startUtc = TimeZoneInfo.ConvertTimeToUtc(
                localStart,
                timeZone);

            var endUtc = TimeZoneInfo.ConvertTimeToUtc(
                localEnd,
                timeZone);

            query = query.Where(item =>
                item.StartDateTimeUtc >= startUtc &&
                item.StartDateTimeUtc < endUtc);
        }

        return await query
            .OrderBy(item => item.StartDateTimeUtc)
            .Select(item => MapResponse(item))
            .ToListAsync(cancellationToken);
    }

    public async Task<AppointmentResponse?> GetByIdAsync(
        Guid userId,
        Guid businessId,
        Guid appointmentId,
        CancellationToken cancellationToken = default)
    {
        await EnsureBusinessMemberAsync(
            userId,
            businessId,
            cancellationToken);

        return await dbContext.Appointments
            .AsNoTracking()
            .Where(item =>
                item.Id == appointmentId &&
                item.BusinessId == businessId)
            .Select(item => MapResponse(item))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<AppointmentResponse?> UpdateStatusAsync(
        Guid userId,
        Guid businessId,
        Guid appointmentId,
        UpdateAppointmentStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureBusinessMemberAsync(
            userId,
            businessId,
            cancellationToken);

        var appointment = await dbContext.Appointments
            .SingleOrDefaultAsync(
                item =>
                    item.Id == appointmentId &&
                    item.BusinessId == businessId,
                cancellationToken);

        if (appointment is null)
        {
            return null;
        }

        appointment.Status = request.Status;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetAppointmentResponseAsync(
            appointmentId,
            cancellationToken);
    }

    public async Task<bool> CancelAsync(
        Guid businessId,
        Guid appointmentId,
        string customerPhone,
        CancellationToken cancellationToken = default)
    {
        var phone = customerPhone.Trim();

        var appointment = await dbContext.Appointments
            .SingleOrDefaultAsync(
                item =>
                    item.Id == appointmentId &&
                    item.BusinessId == businessId &&
                    item.CustomerPhone == phone,
                cancellationToken);

        if (appointment is null)
        {
            return false;
        }

        if (appointment.Status is
            AppointmentStatus.Completed or
            AppointmentStatus.Cancelled)
        {
            throw new InvalidOperationException(
                "This appointment cannot be cancelled.");
        }

        appointment.Status = AppointmentStatus.Cancelled;

        await dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task<AppointmentResponse?>
        GetAppointmentResponseAsync(
            Guid appointmentId,
            CancellationToken cancellationToken)
    {
        return await dbContext.Appointments
            .AsNoTracking()
            .Where(item => item.Id == appointmentId)
            .Select(item => MapResponse(item))
            .SingleOrDefaultAsync(cancellationToken);
    }

    private static AppointmentResponse MapResponse(
        Appointment item)
    {
        return new AppointmentResponse
        {
            Id = item.Id,
            BusinessId = item.BusinessId,
            ServiceId = item.ServiceId,
            ServiceName = item.Service.Name,
            StaffMemberId = item.StaffMemberId,
            StaffName = item.StaffMember.FullName,
            CustomerName = item.CustomerName,
            CustomerPhone = item.CustomerPhone,
            CustomerEmail = item.CustomerEmail,
            StartDateTimeUtc = item.StartDateTimeUtc,
            EndDateTimeUtc = item.EndDateTimeUtc,
            Status = item.Status.ToString(),
            Notes = item.Notes,
            PriceAtBooking = item.PriceAtBooking,
            CreatedAtUtc = item.CreatedAtUtc
        };
    }

    private async Task EnsureBusinessMemberAsync(
        Guid userId,
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var hasAccess = await dbContext.BusinessMembers.AnyAsync(
            item =>
                item.UserId == userId &&
                item.BusinessId == businessId &&
                item.IsActive &&
                item.Business.IsActive,
            cancellationToken);

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException(
                "You do not have access to this business.");
        }
    }

    private static void ValidateCreateRequest(
        CreateAppointmentRequest request)
    {
        if (request.ServiceId == Guid.Empty)
        {
            throw new ArgumentException("Service is required.");
        }

        if (request.StaffMemberId == Guid.Empty)
        {
            throw new ArgumentException("Staff member is required.");
        }

        if (string.IsNullOrWhiteSpace(request.CustomerName))
        {
            throw new ArgumentException("Customer name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
        {
            throw new ArgumentException("Customer phone is required.");
        }
    }

    private static TimeZoneInfo ResolveTimeZone(
        string timeZoneId)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        }
        catch (TimeZoneNotFoundException)
        {
            throw new InvalidOperationException(
                $"The configured time zone '{timeZoneId}' is invalid.");
        }
    }

    private static string? CleanOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}