using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QueueMate.Api.Data;

namespace QueueMate.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/public/businesses")]
public sealed class PublicBookingController(
    ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet("{businessId:guid}/services")]
    public async Task<IActionResult> GetServices(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var services = await dbContext.Services
            .AsNoTracking()
            .Where(service =>
                service.BusinessId == businessId &&
                service.IsActive &&
                service.Business.IsActive)
            .OrderBy(service => service.Name)
            .Select(service => new
            {
                service.Id,
                service.BusinessId,
                service.Name,
                service.Description,
                service.DurationMinutes,
                service.Price,
                service.IsActive
            })
            .ToListAsync(cancellationToken);

        return Ok(services);
    }

    [HttpGet("{businessId:guid}/staff")]
    public async Task<IActionResult> GetStaff(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var staff = await dbContext.StaffMembers
            .AsNoTracking()
            .Where(item =>
                item.BusinessId == businessId &&
                item.IsActive &&
                item.Business.IsActive)
            .OrderBy(item => item.FullName)
            .Select(item => new
            {
                item.Id,
                item.BusinessId,
                item.FullName,
                item.JobTitle,
                item.IsActive,
                Services = item.StaffServices
                    .Where(mapping =>
                        mapping.Service.IsActive)
                    .Select(mapping => new
                    {
                        mapping.Service.Id,
                        mapping.Service.Name,
                        mapping.Service.DurationMinutes,
                        mapping.Service.Price,
                        mapping.Service.IsActive
                    })
                    .ToList()
            })
            .ToListAsync(cancellationToken);

        return Ok(staff);
    }
}