using QueueMate.Api.DTOs.Services;

namespace QueueMate.Api.Interfaces;

public interface IServiceManagementService
{
    Task<ServiceResponse> CreateAsync(
        Guid userId,
        Guid businessId,
        CreateServiceRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ServiceResponse>> GetAllAsync(
        Guid userId,
        Guid businessId,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse?> GetByIdAsync(
        Guid userId,
        Guid businessId,
        Guid serviceId,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse?> UpdateAsync(
        Guid userId,
        Guid businessId,
        Guid serviceId,
        UpdateServiceRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        Guid userId,
        Guid businessId,
        Guid serviceId,
        CancellationToken cancellationToken = default);
}