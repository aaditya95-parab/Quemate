using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QueueMate.Api.DTOs.Services;
using QueueMate.Api.Interfaces;

namespace QueueMate.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/businesses/{businessId:guid}/services")]
public sealed class ServicesController(
    IServiceManagementService serviceManagement)
    : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ServiceResponse>> Create(
        Guid businessId,
        CreateServiceRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await serviceManagement.CreateAsync(
                userId,
                businessId,
                request,
                cancellationToken);

            return StatusCode(
                StatusCodes.Status201Created,
                result);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = exception.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ServiceResponse>>> GetAll(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await serviceManagement.GetAllAsync(
                userId,
                businessId,
                cancellationToken);

            return Ok(result);
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = exception.Message });
        }
    }

    [HttpGet("{serviceId:guid}")]
    public async Task<ActionResult<ServiceResponse>> GetById(
        Guid businessId,
        Guid serviceId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await serviceManagement.GetByIdAsync(
                userId,
                businessId,
                serviceId,
                cancellationToken);

            return result is null
                ? NotFound(new { message = "Service was not found." })
                : Ok(result);
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = exception.Message });
        }
    }

    [HttpPut("{serviceId:guid}")]
    public async Task<ActionResult<ServiceResponse>> Update(
        Guid businessId,
        Guid serviceId,
        UpdateServiceRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await serviceManagement.UpdateAsync(
                userId,
                businessId,
                serviceId,
                request,
                cancellationToken);

            return result is null
                ? NotFound(new { message = "Service was not found." })
                : Ok(result);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = exception.Message });
        }
    }

    [HttpDelete("{serviceId:guid}")]
    public async Task<IActionResult> Delete(
        Guid businessId,
        Guid serviceId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var deleted = await serviceManagement.DeleteAsync(
                userId,
                businessId,
                serviceId,
                cancellationToken);

            return deleted
                ? NoContent()
                : NotFound(new { message = "Service was not found." });
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = exception.Message });
        }
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out userId);
    }
}