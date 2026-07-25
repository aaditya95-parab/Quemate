using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QueueMate.Api.DTOs.Staff;
using QueueMate.Api.Interfaces;

namespace QueueMate.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/businesses/{businessId:guid}/staff")]
public sealed class StaffController(
    IStaffService staffService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<StaffResponse>> Create(
        Guid businessId,
        CreateStaffRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await staffService.CreateAsync(
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
    public async Task<ActionResult<IReadOnlyList<StaffResponse>>> GetAll(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await staffService.GetAllAsync(
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

    [HttpGet("{staffId:guid}")]
    public async Task<ActionResult<StaffResponse>> GetById(
        Guid businessId,
        Guid staffId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await staffService.GetByIdAsync(
                userId,
                businessId,
                staffId,
                cancellationToken);

            return result is null
                ? NotFound(new { message = "Staff member was not found." })
                : Ok(result);
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = exception.Message });
        }
    }

    [HttpPut("{staffId:guid}")]
    public async Task<ActionResult<StaffResponse>> Update(
        Guid businessId,
        Guid staffId,
        UpdateStaffRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await staffService.UpdateAsync(
                userId,
                businessId,
                staffId,
                request,
                cancellationToken);

            return result is null
                ? NotFound(new { message = "Staff member was not found." })
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

    [HttpPut("{staffId:guid}/services")]
    public async Task<ActionResult<StaffResponse>> AssignServices(
        Guid businessId,
        Guid staffId,
        AssignStaffServicesRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await staffService.AssignServicesAsync(
                userId,
                businessId,
                staffId,
                request,
                cancellationToken);

            return result is null
                ? NotFound(new { message = "Staff member was not found." })
                : Ok(result);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = exception.Message });
        }
    }

    [HttpDelete("{staffId:guid}")]
    public async Task<IActionResult> Deactivate(
        Guid businessId,
        Guid staffId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var deactivated = await staffService.DeactivateAsync(
                userId,
                businessId,
                staffId,
                cancellationToken);

            return deactivated
                ? NoContent()
                : NotFound(new { message = "Staff member was not found." });
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