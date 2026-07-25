using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QueueMate.Api.DTOs.Appointments;
using QueueMate.Api.Interfaces;

namespace QueueMate.Api.Controllers;

[ApiController]
[Route("api/businesses/{businessId:guid}/appointments")]
public sealed class AppointmentsController(
    IAppointmentService appointmentService) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("available-slots")]
    public async Task<ActionResult<IReadOnlyList<AvailableSlotResponse>>>
        GetAvailableSlots(
            Guid businessId,
            [FromQuery] Guid serviceId,
            [FromQuery] Guid staffId,
            [FromQuery] DateOnly date,
            CancellationToken cancellationToken)
    {
        try
        {
            var result =
                await appointmentService.GetAvailableSlotsAsync(
                    businessId,
                    serviceId,
                    staffId,
                    date,
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
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult<AppointmentResponse>> Create(
        Guid businessId,
        CreateAppointmentRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await appointmentService.CreateAsync(
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
    public async Task<ActionResult<IReadOnlyList<AppointmentResponse>>>
        GetAll(
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
            var result =
                await appointmentService.GetBusinessAppointmentsAsync(
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
    }

    [Authorize]
    [HttpGet("{appointmentId:guid}")]
    public async Task<ActionResult<AppointmentResponse>> GetById(
        Guid businessId,
        Guid appointmentId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await appointmentService.GetByIdAsync(
                userId,
                businessId,
                appointmentId,
                cancellationToken);

            return result is null
                ? NotFound(new { message = "Appointment was not found." })
                : Ok(result);
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = exception.Message });
        }
    }

    [Authorize]
    [HttpPatch("{appointmentId:guid}/status")]
    public async Task<ActionResult<AppointmentResponse>> UpdateStatus(
        Guid businessId,
        Guid appointmentId,
        UpdateAppointmentStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await appointmentService.UpdateStatusAsync(
                userId,
                businessId,
                appointmentId,
                request,
                cancellationToken);

            return result is null
                ? NotFound(new { message = "Appointment was not found." })
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
    [HttpPost("{appointmentId:guid}/cancel")]
    public async Task<IActionResult> Cancel(
        Guid businessId,
        Guid appointmentId,
        [FromQuery] string customerPhone,
        CancellationToken cancellationToken)
    {
        try
        {
            var cancelled = await appointmentService.CancelAsync(
                businessId,
                appointmentId,
                customerPhone,
                cancellationToken);

            return cancelled
                ? NoContent()
                : NotFound(new
                {
                    message = "Appointment was not found."
                });
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