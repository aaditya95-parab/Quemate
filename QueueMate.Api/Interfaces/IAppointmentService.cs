using QueueMate.Api.DTOs.Appointments;

namespace QueueMate.Api.Interfaces;

public interface IAppointmentService
{
    Task<IReadOnlyList<AvailableSlotResponse>> GetAvailableSlotsAsync(
        Guid businessId,
        Guid serviceId,
        Guid staffId,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task<AppointmentResponse> CreateAsync(
        Guid businessId,
        CreateAppointmentRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AppointmentResponse>> GetBusinessAppointmentsAsync(
        Guid userId,
        Guid businessId,
        DateOnly? date,
        CancellationToken cancellationToken = default);

    Task<AppointmentResponse?> GetByIdAsync(
        Guid userId,
        Guid businessId,
        Guid appointmentId,
        CancellationToken cancellationToken = default);

    Task<AppointmentResponse?> UpdateStatusAsync(
        Guid userId,
        Guid businessId,
        Guid appointmentId,
        UpdateAppointmentStatusRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> CancelAsync(
        Guid businessId,
        Guid appointmentId,
        string customerPhone,
        CancellationToken cancellationToken = default);
}