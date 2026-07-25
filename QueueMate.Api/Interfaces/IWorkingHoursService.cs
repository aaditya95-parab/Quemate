using QueueMate.Api.DTOs.WorkingHours;

namespace QueueMate.Api.Interfaces;

public interface IWorkingHoursService
{
    Task<IReadOnlyList<WorkingHourResponse>> GetBusinessHoursAsync(
        Guid userId,
        Guid businessId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WorkingHourResponse>> UpdateBusinessHoursAsync(
        Guid userId,
        Guid businessId,
        UpdateBusinessHoursRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WorkingHourResponse>> GetStaffHoursAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WorkingHourResponse>> UpdateStaffHoursAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        UpdateStaffHoursRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<StaffTimeOffResponse>> GetStaffTimeOffAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        CancellationToken cancellationToken = default);

    Task<StaffTimeOffResponse> CreateStaffTimeOffAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        CreateStaffTimeOffRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteStaffTimeOffAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        Guid timeOffId,
        CancellationToken cancellationToken = default);
}