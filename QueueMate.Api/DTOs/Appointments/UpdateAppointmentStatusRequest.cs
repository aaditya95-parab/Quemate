using QueueMate.Api.Enums;

namespace QueueMate.Api.DTOs.Appointments;

public sealed class UpdateAppointmentStatusRequest
{
    public AppointmentStatus Status { get; set; }
}