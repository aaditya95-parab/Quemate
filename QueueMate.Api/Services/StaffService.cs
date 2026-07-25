using Microsoft.EntityFrameworkCore;
using QueueMate.Api.Data;
using QueueMate.Api.DTOs.Staff;
using QueueMate.Api.Enums;
using QueueMate.Api.Interfaces;
using QueueMate.Api.Models;

namespace QueueMate.Api.Services;

public sealed class StaffService(
    ApplicationDbContext dbContext) : IStaffService
{
    public async Task<StaffResponse> CreateAsync(
        Guid userId,
        Guid businessId,
        CreateStaffRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureCanManageBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        var fullName = request.FullName.Trim();
        var email = CleanOptionalValue(request.Email)?.ToLowerInvariant();

        ValidateStaff(fullName, email);

        if (!string.IsNullOrWhiteSpace(email))
        {
            var duplicateEmail = await dbContext.StaffMembers.AnyAsync(
                staff =>
                    staff.BusinessId == businessId &&
                    staff.Email == email &&
                    staff.IsActive,
                cancellationToken);

            if (duplicateEmail)
            {
                throw new InvalidOperationException(
                    "A staff member with this email already exists.");
            }
        }

        var validServiceIds = await ValidateServiceIdsAsync(
            businessId,
            request.ServiceIds,
            cancellationToken);

        var staff = new StaffMember
        {
            BusinessId = businessId,
            FullName = fullName,
            Email = email,
            Phone = CleanOptionalValue(request.Phone),
            JobTitle = CleanOptionalValue(request.JobTitle),
            IsActive = true
        };

        foreach (var serviceId in validServiceIds)
        {
            staff.StaffServices.Add(new Models.StaffService
            {
                ServiceId = serviceId
            });
        }

        dbContext.StaffMembers.Add(staff);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetStaffResponseAsync(
                   businessId,
                   staff.Id,
                   cancellationToken)
               ?? throw new InvalidOperationException(
                   "Staff member was created but could not be loaded.");
    }

    public async Task<IReadOnlyList<StaffResponse>> GetAllAsync(
        Guid userId,
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        await EnsureBusinessMemberAsync(
            userId,
            businessId,
            cancellationToken);

        return await dbContext.StaffMembers
            .AsNoTracking()
            .Where(staff => staff.BusinessId == businessId)
            .OrderBy(staff => staff.FullName)
            .Select(staff => new StaffResponse
            {
                Id = staff.Id,
                BusinessId = staff.BusinessId,
                FullName = staff.FullName,
                Email = staff.Email,
                Phone = staff.Phone,
                JobTitle = staff.JobTitle,
                IsActive = staff.IsActive,
                CreatedAtUtc = staff.CreatedAtUtc,
                UpdatedAtUtc = staff.UpdatedAtUtc,
                Services = staff.StaffServices
                    .OrderBy(mapping => mapping.Service.Name)
                    .Select(mapping => new StaffServiceResponse
                    {
                        Id = mapping.Service.Id,
                        Name = mapping.Service.Name,
                        DurationMinutes =
                            mapping.Service.DurationMinutes,
                        Price = mapping.Service.Price,
                        IsActive = mapping.Service.IsActive
                    })
                    .ToList()
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<StaffResponse?> GetByIdAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        CancellationToken cancellationToken = default)
    {
        await EnsureBusinessMemberAsync(
            userId,
            businessId,
            cancellationToken);

        return await GetStaffResponseAsync(
            businessId,
            staffId,
            cancellationToken);
    }

    public async Task<StaffResponse?> UpdateAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        UpdateStaffRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureCanManageBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        var fullName = request.FullName.Trim();
        var email = CleanOptionalValue(request.Email)?.ToLowerInvariant();

        ValidateStaff(fullName, email);

        var staff = await dbContext.StaffMembers
            .SingleOrDefaultAsync(
                item =>
                    item.Id == staffId &&
                    item.BusinessId == businessId,
                cancellationToken);

        if (staff is null)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(email))
        {
            var duplicateEmail = await dbContext.StaffMembers.AnyAsync(
                item =>
                    item.BusinessId == businessId &&
                    item.Id != staffId &&
                    item.Email == email &&
                    item.IsActive,
                cancellationToken);

            if (duplicateEmail)
            {
                throw new InvalidOperationException(
                    "A staff member with this email already exists.");
            }
        }

        staff.FullName = fullName;
        staff.Email = email;
        staff.Phone = CleanOptionalValue(request.Phone);
        staff.JobTitle = CleanOptionalValue(request.JobTitle);
        staff.IsActive = request.IsActive;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetStaffResponseAsync(
            businessId,
            staffId,
            cancellationToken);
    }

    public async Task<StaffResponse?> AssignServicesAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        AssignStaffServicesRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureCanManageBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        var staff = await dbContext.StaffMembers
            .Include(item => item.StaffServices)
            .SingleOrDefaultAsync(
                item =>
                    item.Id == staffId &&
                    item.BusinessId == businessId,
                cancellationToken);

        if (staff is null)
        {
            return null;
        }

        var validServiceIds = await ValidateServiceIdsAsync(
            businessId,
            request.ServiceIds,
            cancellationToken);

        dbContext.StaffServices.RemoveRange(staff.StaffServices);

        foreach (var serviceId in validServiceIds)
        {
            staff.StaffServices.Add(new Models.StaffService
            {
                StaffMemberId = staff.Id,
                ServiceId = serviceId
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetStaffResponseAsync(
            businessId,
            staffId,
            cancellationToken);
    }

    public async Task<bool> DeactivateAsync(
        Guid userId,
        Guid businessId,
        Guid staffId,
        CancellationToken cancellationToken = default)
    {
        await EnsureCanManageBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        var staff = await dbContext.StaffMembers
            .SingleOrDefaultAsync(
                item =>
                    item.Id == staffId &&
                    item.BusinessId == businessId,
                cancellationToken);

        if (staff is null)
        {
            return false;
        }

        staff.IsActive = false;

        await dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task<StaffResponse?> GetStaffResponseAsync(
        Guid businessId,
        Guid staffId,
        CancellationToken cancellationToken)
    {
        return await dbContext.StaffMembers
            .AsNoTracking()
            .Where(staff =>
                staff.Id == staffId &&
                staff.BusinessId == businessId)
            .Select(staff => new StaffResponse
            {
                Id = staff.Id,
                BusinessId = staff.BusinessId,
                FullName = staff.FullName,
                Email = staff.Email,
                Phone = staff.Phone,
                JobTitle = staff.JobTitle,
                IsActive = staff.IsActive,
                CreatedAtUtc = staff.CreatedAtUtc,
                UpdatedAtUtc = staff.UpdatedAtUtc,
                Services = staff.StaffServices
                    .OrderBy(mapping => mapping.Service.Name)
                    .Select(mapping => new StaffServiceResponse
                    {
                        Id = mapping.Service.Id,
                        Name = mapping.Service.Name,
                        DurationMinutes =
                            mapping.Service.DurationMinutes,
                        Price = mapping.Service.Price,
                        IsActive = mapping.Service.IsActive
                    })
                    .ToList()
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    private async Task<List<Guid>> ValidateServiceIdsAsync(
        Guid businessId,
        IEnumerable<Guid>? serviceIds,
        CancellationToken cancellationToken)
    {
        var requestedIds = serviceIds?
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList() ?? [];

        if (requestedIds.Count == 0)
        {
            return [];
        }

        var validIds = await dbContext.Services
            .AsNoTracking()
            .Where(service =>
                service.BusinessId == businessId &&
                service.IsActive &&
                requestedIds.Contains(service.Id))
            .Select(service => service.Id)
            .ToListAsync(cancellationToken);

        if (validIds.Count != requestedIds.Count)
        {
            throw new ArgumentException(
                "One or more selected services are invalid or inactive.");
        }

        return validIds;
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
                "Only owners and managers can manage staff.");
        }
    }

    private static void ValidateStaff(
        string fullName,
        string? email)
    {
        if (string.IsNullOrWhiteSpace(fullName))
        {
            throw new ArgumentException(
                "Staff name is required.");
        }

        if (fullName.Length > 120)
        {
            throw new ArgumentException(
                "Staff name cannot exceed 120 characters.");
        }

        if (email?.Length > 255)
        {
            throw new ArgumentException(
                "Email cannot exceed 255 characters.");
        }
    }

    private static string? CleanOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}