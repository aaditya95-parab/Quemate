using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QueueMate.Api.DTOs.Businesses;
using QueueMate.Api.Interfaces;

namespace QueueMate.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/businesses")]
public sealed class BusinessesController(
    IBusinessService businessService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<BusinessResponse>> CreateBusiness(
        CreateBusinessRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var response =
                await businessService.CreateBusinessAsync(
                    userId,
                    request,
                    cancellationToken);

            return CreatedAtAction(
                nameof(GetBusinessById),
                new { businessId = response.Id },
                response);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(new
            {
                message = exception.Message
            });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BusinessResponse>>>
        GetMyBusinesses(
            CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        var businesses =
            await businessService.GetUserBusinessesAsync(
                userId,
                cancellationToken);

        return Ok(businesses);
    }

    [HttpGet("{businessId:guid}")]
    public async Task<ActionResult<BusinessResponse>> GetBusinessById(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        var business =
            await businessService.GetBusinessByIdAsync(
                userId,
                businessId,
                cancellationToken);

        return business is null
            ? NotFound(new
            {
                message = "Business was not found."
            })
            : Ok(business);
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out userId);
    }
}