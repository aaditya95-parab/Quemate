using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QueueMate.Api.DTOs.WorkingHours;
using QueueMate.Api.Interfaces;

namespace QueueMate.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/businesses/{businessId:guid}")]
public sealed class WorkingHoursController(
    IWorkingHoursService workingHoursService) : ControllerBase
{
    [HttpGet("working-hours")]
    public async Task<ActionResult<IReadOnlyList<WorkingHourResponse>>>
        GetBusinessHours(
            Guid businessId,
            CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result =
                await workingHoursService.GetBusinessHoursAsync(
                    userId,
                    businessId,
                    cancellationToken);

            return Ok(result);
        }
        catch (UnauthorizedAccessException exception)
        {
            return Forbidden(exception.Message);
        }
    }

    [HttpPut("working-hours")]
    public async Task<ActionResult<IReadOnlyList<WorkingHourResponse>>>
        UpdateBusinessHours(
            Guid businessId,
            UpdateBusinessHoursRequest request,
            CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result =
                await workingHoursService.UpdateBusinessHoursAsync(
                    userId,
                    businessId,
                    request,
                    cancellationToken);

            return Ok(result);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (UnauthorizedAccessException exception)
        {
            return Forbidden(exception.Message);
        }
    }

    [HttpGet("staff/{staffId:guid}/working-hours")]
    public async Task<ActionResult<IReadOnlyList<WorkingHourResponse>>>
        GetStaffHours(
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
            var result =
                await workingHoursService.GetStaffHoursAsync(
                    userId,
                    businessId,
                    staffId,
                    cancellationToken);

            return Ok(result);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
        catch (UnauthorizedAccessException exception)
        {
            return Forbidden(exception.Message);
        }
    }

    [HttpPut("staff/{staffId:guid}/working-hours")]
    public async Task<ActionResult<IReadOnlyList<WorkingHourResponse>>>
        UpdateStaffHours(
            Guid businessId,
            Guid staffId,
            UpdateStaffHoursRequest request,
            CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result =
                await workingHoursService.UpdateStaffHoursAsync(
                    userId,
                    businessId,
                    staffId,
                    request,
                    cancellationToken);

            return Ok(result);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
        catch (UnauthorizedAccessException exception)
        {
            return Forbidden(exception.Message);
        }
    }

    [HttpGet("staff/{staffId:guid}/time-off")]
    public async Task<ActionResult<IReadOnlyList<StaffTimeOffResponse>>>
        GetStaffTimeOff(
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
            var result =
                await workingHoursService.GetStaffTimeOffAsync(
                    userId,
                    businessId,
                    staffId,
                    cancellationToken);

            return Ok(result);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
        catch (UnauthorizedAccessException exception)
        {
            return Forbidden(exception.Message);
        }
    }

    [HttpPost("staff/{staffId:guid}/time-off")]
    public async Task<ActionResult<StaffTimeOffResponse>>
        CreateStaffTimeOff(
            Guid businessId,
            Guid staffId,
            CreateStaffTimeOffRequest request,
            CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result =
                await workingHoursService.CreateStaffTimeOffAsync(
                    userId,
                    businessId,
                    staffId,
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
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
        catch (UnauthorizedAccessException exception)
        {
            return Forbidden(exception.Message);
        }
    }

    [HttpDelete("staff/{staffId:guid}/time-off/{timeOffId:guid}")]
    public async Task<IActionResult> DeleteStaffTimeOff(
        Guid businessId,
        Guid staffId,
        Guid timeOffId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var deleted =
                await workingHoursService.DeleteStaffTimeOffAsync(
                    userId,
                    businessId,
                    staffId,
                    timeOffId,
                    cancellationToken);

            return deleted
                ? NoContent()
                : NotFound(new
                {
                    message = "Time-off entry was not found."
                });
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
        catch (UnauthorizedAccessException exception)
        {
            return Forbidden(exception.Message);
        }
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out userId);
    }

    private ObjectResult Forbidden(string message)
    {
        return StatusCode(
            StatusCodes.Status403Forbidden,
            new { message });
    }
}