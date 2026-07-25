import {
  Clock3,
  UserRound,
} from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import type { Appointment } from "../../types/appointment";
import { getInitials } from "../../utils/format";

interface UpcomingAppointmentItemProps {
  appointment: Appointment;
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UpcomingAppointmentItem({
  appointment,
}: UpcomingAppointmentItemProps) {
  return (
    <article className="entity-card">
      <div className="entity-card__header">
        <div className="user-chip">
          <span className="avatar">
            {getInitials(appointment.customerName)}
          </span>
          <div>
            <strong>{appointment.customerName}</strong>
            <span>{appointment.serviceName}</span>
          </div>
        </div>

        <StatusBadge status={appointment.status} />
      </div>

      <div className="entity-row">
        <span className="meta-pill">
          <Clock3 size={15} />
          {formatTime(appointment.startDateTimeUtc)}
        </span>

        <span className="meta-pill">
          <UserRound size={15} />
          {appointment.staffName}
        </span>
      </div>
    </article>
  );
}
