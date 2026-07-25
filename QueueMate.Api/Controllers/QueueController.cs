using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QueueMate.Api.DTOs.Queue;
using QueueMate.Api.Interfaces;

namespace QueueMate.Api.Controllers;

[ApiController]
[Route("api/businesses/{businessId:guid}/queue")]
public sealed class QueueController(
    IQueueService queueService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("join")]
    public async Task<ActionResult<QueueEntryResponse>> JoinQueue(
        Guid businessId,
        JoinQueueRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await queueService.JoinQueueAsync(
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
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<QueueEntryResponse>>>
        GetLiveQueue(
            Guid businessId,
            [FromQuery] DateOnly? date,
            CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await queueService.GetLiveQueueAsync(
                userId,
                businessId,
                date,
                cancellationToken);

            return Ok(result);
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = exception.Message });
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [Authorize]
    [HttpPatch("{queueEntryId:guid}/status")]
    public async Task<ActionResult<QueueEntryResponse>> UpdateStatus(
        Guid businessId,
        Guid queueEntryId,
        UpdateQueueStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await queueService.UpdateStatusAsync(
                userId,
                businessId,
                queueEntryId,
                request,
                cancellationToken);

            return result is null
                ? NotFound(new { message = "Queue entry was not found." })
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
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [Authorize]
    [HttpPost("call-next")]
    public async Task<ActionResult<QueueEntryResponse>> CallNext(
        Guid businessId,
        [FromQuery] Guid? serviceId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await queueService.CallNextAsync(
                userId,
                businessId,
                serviceId,
                cancellationToken);

            return result is null
                ? NotFound(new { message = "No waiting customer was found." })
                : Ok(result);
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = exception.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("{queueEntryId:guid}/track")]
    public async Task<ActionResult<QueueTrackingResponse>> Track(
        Guid businessId,
        Guid queueEntryId,
        [FromQuery] string customerPhone,
        CancellationToken cancellationToken)
    {
        var result = await queueService.TrackTokenAsync(
            businessId,
            queueEntryId,
            customerPhone,
            cancellationToken);

        return result is null
            ? NotFound(new { message = "Queue token was not found." })
            : Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("{queueEntryId:guid}/cancel")]
    public async Task<IActionResult> Cancel(
        Guid businessId,
        Guid queueEntryId,
        [FromQuery] string customerPhone,
        CancellationToken cancellationToken)
    {
        try
        {
            var cancelled = await queueService.CancelAsync(
                businessId,
                queueEntryId,
                customerPhone,
                cancellationToken);

            return cancelled
                ? NoContent()
                : NotFound(new { message = "Queue token was not found." });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out userId);
    }
}
