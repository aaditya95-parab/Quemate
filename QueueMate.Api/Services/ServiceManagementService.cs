using Microsoft.EntityFrameworkCore;
using QueueMate.Api.Data;
using QueueMate.Api.DTOs.Services;
using QueueMate.Api.Enums;
using QueueMate.Api.Interfaces;
using QueueMate.Api.Models;

namespace QueueMate.Api.Services;

public sealed class ServiceManagementService(
    ApplicationDbContext dbContext) : IServiceManagementService
{
    public async Task<ServiceResponse> CreateAsync(
        Guid userId,
        Guid businessId,
        CreateServiceRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureCanManageBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        var name = request.Name.Trim();

        ValidateService(
            name,
            request.DurationMinutes,
            request.Price);

        var duplicateExists = await dbContext.Services.AnyAsync(
            service =>
                service.BusinessId == businessId &&
                service.Name.ToLower() == name.ToLower(),
            cancellationToken);

        if (duplicateExists)
        {
            throw new InvalidOperationException(
                "A service with this name already exists.");
        }

        var service = new Service
        {
            BusinessId = businessId,
            Name = name,
            Description = CleanOptionalValue(request.Description),
            DurationMinutes = request.DurationMinutes,
            Price = request.Price,
            IsActive = true
        };

        dbContext.Services.Add(service);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Map(service);
    }

    public async Task<IReadOnlyList<ServiceResponse>> GetAllAsync(
        Guid userId,
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        await EnsureBusinessMemberAsync(
            userId,
            businessId,
            cancellationToken);

        return await dbContext.Services
            .AsNoTracking()
            .Where(service => service.BusinessId == businessId)
            .OrderBy(service => service.Name)
            .Select(service => new ServiceResponse
            {
                Id = service.Id,
                BusinessId = service.BusinessId,
                Name = service.Name,
                Description = service.Description,
                DurationMinutes = service.DurationMinutes,
                Price = service.Price,
                IsActive = service.IsActive,
                CreatedAtUtc = service.CreatedAtUtc,
                UpdatedAtUtc = service.UpdatedAtUtc
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ServiceResponse?> GetByIdAsync(
        Guid userId,
        Guid businessId,
        Guid serviceId,
        CancellationToken cancellationToken = default)
    {
        await EnsureBusinessMemberAsync(
            userId,
            businessId,
            cancellationToken);

        return await dbContext.Services
            .AsNoTracking()
            .Where(service =>
                service.Id == serviceId &&
                service.BusinessId == businessId)
            .Select(service => new ServiceResponse
            {
                Id = service.Id,
                BusinessId = service.BusinessId,
                Name = service.Name,
                Description = service.Description,
                DurationMinutes = service.DurationMinutes,
                Price = service.Price,
                IsActive = service.IsActive,
                CreatedAtUtc = service.CreatedAtUtc,
                UpdatedAtUtc = service.UpdatedAtUtc
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<ServiceResponse?> UpdateAsync(
        Guid userId,
        Guid businessId,
        Guid serviceId,
        UpdateServiceRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureCanManageBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        var name = request.Name.Trim();

        ValidateService(
            name,
            request.DurationMinutes,
            request.Price);

        var service = await dbContext.Services.SingleOrDefaultAsync(
            item =>
                item.Id == serviceId &&
                item.BusinessId == businessId,
            cancellationToken);

        if (service is null)
        {
            return null;
        }

        var duplicateExists = await dbContext.Services.AnyAsync(
            item =>
                item.BusinessId == businessId &&
                item.Id != serviceId &&
                item.Name.ToLower() == name.ToLower(),
            cancellationToken);

        if (duplicateExists)
        {
            throw new InvalidOperationException(
                "A service with this name already exists.");
        }

        service.Name = name;
        service.Description = CleanOptionalValue(request.Description);
        service.DurationMinutes = request.DurationMinutes;
        service.Price = request.Price;
        service.IsActive = request.IsActive;

        await dbContext.SaveChangesAsync(cancellationToken);

        return Map(service);
    }

    public async Task<bool> DeleteAsync(
        Guid userId,
        Guid businessId,
        Guid serviceId,
        CancellationToken cancellationToken = default)
    {
        await EnsureCanManageBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        var service = await dbContext.Services.SingleOrDefaultAsync(
            item =>
                item.Id == serviceId &&
                item.BusinessId == businessId,
            cancellationToken);

        if (service is null)
        {
            return false;
        }

        service.IsActive = false;

        await dbContext.SaveChangesAsync(cancellationToken);

        return true;
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

    private async Task EnsureCanManageBusinessAsync(
        Guid userId,
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var membership = await dbContext.BusinessMembers
            .AsNoTracking()
            .SingleOrDefaultAsync(
                member =>
                    member.UserId == userId &&
                    member.BusinessId == businessId &&
                    member.IsActive &&
                    member.Business.IsActive,
                cancellationToken);

        if (membership is null)
        {
            throw new UnauthorizedAccessException(
                "You do not have access to this business.");
        }

        if (membership.Role is not BusinessRole.Owner
            and not BusinessRole.Manager)
        {
            throw new UnauthorizedAccessException(
                "Only owners and managers can manage services.");
        }
    }

    private static void ValidateService(
        string name,
        int durationMinutes,
        decimal price)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException(
                "Service name is required.");
        }

        if (name.Length > 120)
        {
            throw new ArgumentException(
                "Service name cannot exceed 120 characters.");
        }

        if (durationMinutes < 5 || durationMinutes > 1440)
        {
            throw new ArgumentException(
                "Duration must be between 5 and 1440 minutes.");
        }

        if (price < 0)
        {
            throw new ArgumentException(
                "Price cannot be negative.");
        }
    }

    private static string? CleanOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static ServiceResponse Map(Service service)
    {
        return new ServiceResponse
        {
            Id = service.Id,
            BusinessId = service.BusinessId,
            Name = service.Name,
            Description = service.Description,
            DurationMinutes = service.DurationMinutes,
            Price = service.Price,
            IsActive = service.IsActive,
            CreatedAtUtc = service.CreatedAtUtc,
            UpdatedAtUtc = service.UpdatedAtUtc
        };
    }
}