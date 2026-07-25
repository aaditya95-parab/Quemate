using QueueMate.Api.DTOs.Businesses;

namespace QueueMate.Api.Interfaces;

public interface IBusinessService
{
    Task<BusinessResponse> CreateBusinessAsync(
        Guid userId,
        CreateBusinessRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BusinessResponse>> GetUserBusinessesAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<BusinessResponse?> GetBusinessByIdAsync(
        Guid userId,
        Guid businessId,
        CancellationToken cancellationToken = default);
}