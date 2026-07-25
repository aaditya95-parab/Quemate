using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using QueueMate.Api.Data;
using QueueMate.Api.DTOs.Businesses;
using QueueMate.Api.Enums;
using QueueMate.Api.Interfaces;
using QueueMate.Api.Models;

namespace QueueMate.Api.Services;

public sealed class BusinessService(
    ApplicationDbContext dbContext) : IBusinessService
{
    public async Task<BusinessResponse> CreateBusinessAsync(
        Guid userId,
        CreateBusinessRequest request,
        CancellationToken cancellationToken = default)
    {
        var userExists = await dbContext.Users
            .AnyAsync(
                user => user.Id == userId && user.IsActive,
                cancellationToken);

        if (!userExists)
        {
            throw new UnauthorizedAccessException(
                "The authenticated user was not found.");
        }

        var name = request.Name.Trim();
        var category = request.Category.Trim();
        var timeZone = request.TimeZone.Trim();

        ValidateRequest(name, category, timeZone);

        var slug = await GenerateUniqueSlugAsync(
            name,
            cancellationToken);

        var business = new Business
        {
            Name = name,
            Slug = slug,
            Category = category,
            Phone = CleanOptionalValue(request.Phone),
            Email = CleanOptionalValue(request.Email)?.ToLowerInvariant(),
            Address = CleanOptionalValue(request.Address),
            TimeZone = timeZone
        };

        var ownerMembership = new BusinessMember
        {
            UserId = userId,
            Business = business,
            Role = BusinessRole.Owner,
            IsActive = true
        };

        dbContext.Businesses.Add(business);
        dbContext.BusinessMembers.Add(ownerMembership);

        await dbContext.SaveChangesAsync(cancellationToken);

        return MapBusinessResponse(
            business,
            BusinessRole.Owner);
    }

    public async Task<IReadOnlyList<BusinessResponse>> GetUserBusinessesAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.BusinessMembers
            .AsNoTracking()
            .Where(member =>
                member.UserId == userId &&
                member.IsActive &&
                member.Business.IsActive)
            .OrderBy(member => member.Business.Name)
            .Select(member => new BusinessResponse
            {
                Id = member.Business.Id,
                Name = member.Business.Name,
                Slug = member.Business.Slug,
                Category = member.Business.Category,
                Phone = member.Business.Phone,
                Email = member.Business.Email,
                Address = member.Business.Address,
                TimeZone = member.Business.TimeZone,
                CurrentUserRole = member.Role.ToString(),
                CreatedAtUtc = member.Business.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<BusinessResponse?> GetBusinessByIdAsync(
        Guid userId,
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.BusinessMembers
            .AsNoTracking()
            .Where(member =>
                member.UserId == userId &&
                member.BusinessId == businessId &&
                member.IsActive &&
                member.Business.IsActive)
            .Select(member => new BusinessResponse
            {
                Id = member.Business.Id,
                Name = member.Business.Name,
                Slug = member.Business.Slug,
                Category = member.Business.Category,
                Phone = member.Business.Phone,
                Email = member.Business.Email,
                Address = member.Business.Address,
                TimeZone = member.Business.TimeZone,
                CurrentUserRole = member.Role.ToString(),
                CreatedAtUtc = member.Business.CreatedAtUtc
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    private async Task<string> GenerateUniqueSlugAsync(
        string businessName,
        CancellationToken cancellationToken)
    {
        var baseSlug = CreateSlug(businessName);
        var candidate = baseSlug;
        var suffix = 2;

        while (await dbContext.Businesses.AnyAsync(
                   business => business.Slug == candidate,
                   cancellationToken))
        {
            candidate = $"{baseSlug}-{suffix}";
            suffix++;
        }

        return candidate;
    }

    private static string CreateSlug(string value)
    {
        var slug = value.Trim().ToLowerInvariant();

        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", string.Empty);
        slug = Regex.Replace(slug, @"[\s-]+", "-");
        slug = slug.Trim('-');

        return string.IsNullOrWhiteSpace(slug)
            ? $"business-{Guid.NewGuid():N}"[..17]
            : slug;
    }

    private static void ValidateRequest(
        string name,
        string category,
        string timeZone)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException(
                "Business name is required.");
        }

        if (name.Length > 150)
        {
            throw new ArgumentException(
                "Business name cannot exceed 150 characters.");
        }

        if (string.IsNullOrWhiteSpace(category))
        {
            throw new ArgumentException(
                "Business category is required.");
        }

        if (category.Length > 100)
        {
            throw new ArgumentException(
                "Business category cannot exceed 100 characters.");
        }

        if (string.IsNullOrWhiteSpace(timeZone))
        {
            throw new ArgumentException(
                "Time zone is required.");
        }
    }

    private static string? CleanOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static BusinessResponse MapBusinessResponse(
        Business business,
        BusinessRole role)
    {
        return new BusinessResponse
        {
            Id = business.Id,
            Name = business.Name,
            Slug = business.Slug,
            Category = business.Category,
            Phone = business.Phone,
            Email = business.Email,
            Address = business.Address,
            TimeZone = business.TimeZone,
            CurrentUserRole = role.ToString(),
            CreatedAtUtc = business.CreatedAtUtc
        };
    }
}