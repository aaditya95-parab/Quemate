using QueueMate.Api.DTOs.Staff;

namespace QueueMate.Api.Interfaces;

public interface IStaffService
{
    Task<StaffResponse> CreateAsync(
        Guid userId,
        Guid businessId,
        CreateStaffRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<StaffResponse>> GetAllAsync(
        Guid userId,
        Guid businessId,
        CancellationToken cancellationToken = default);

    Task<StaffResponse?> GetByIdAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        CancellationToken cancellationToken = default);

    Task<StaffResponse?> UpdateAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        UpdateStaffRequest request,
        CancellationToken cancellationToken = default);

    Task<StaffResponse?> AssignServicesAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        AssignStaffServicesRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeactivateAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        CancellationToken cancellationToken = default);
}