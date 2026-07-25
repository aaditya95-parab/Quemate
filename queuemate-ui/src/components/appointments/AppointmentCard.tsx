import {
  CalendarDays,
  Clock3,
  IndianRupee,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import type {
  Appointment,
  AppointmentStatusValue,
} from "../../types/appointment";
import { appointmentStatusOptions } from "../../types/appointment";
import { formatInr, getInitials } from "../../utils/format";

interface AppointmentCardProps {
  appointment: Appointment;
  isUpdating: boolean;
  onStatusChange: (
    appointment: Appointment,
    status: AppointmentStatusValue,
  ) => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AppointmentCard({
  appointment,
  isUpdating,
  onStatusChange,
}: AppointmentCardProps) {
  return (
    <article className="entity-card">
      <header className="entity-card__header">
        <div className="user-chip">
          <span className="avatar">
            {getInitials(appointment.customerName)}
          </span>
          <div>
            <strong>{appointment.customerName}</strong>
            <span>{appointment.serviceName}</span>
          </div>
        </div>

        <div className="toolbar">
          <StatusBadge status={appointment.status} />
        <select
          value={
            appointmentStatusOptions.find(
              (item) => item.label === appointment.status,
            )?.value ?? 1
          }
          disabled={isUpdating}
          onChange={(event) =>
            onStatusChange(
              appointment,
              Number(
                event.target.value,
              ) as AppointmentStatusValue,
            )
          }
        >
          {appointmentStatusOptions.map((status) => (
            <option
              key={status.value}
              value={status.value}
            >
              {status.label}
            </option>
          ))}
        </select>
        </div>
      </header>

      <section className="meta-list">
        <p>
          <CalendarDays size={16} />
          {formatDate(appointment.startDateTimeUtc)}
        </p>

        <p>
          <Clock3 size={16} />
          {formatTime(appointment.startDateTimeUtc)}
          {" – "}
          {formatTime(appointment.endDateTimeUtc)}
        </p>

        <p>
          <UserRound size={16} />
          {appointment.staffName}
        </p>
      </section>

      <section className="entity-row">
        <h4>{appointment.serviceName}</h4>

        <p>
          <IndianRupee size={16} />
          {formatInr(appointment.priceAtBooking)}
        </p>
      </section>

      <section className="meta-list">
        <p>
          <Phone size={16} />
          {appointment.customerPhone}
        </p>

        {appointment.customerEmail && (
          <p>
            <Mail size={16} />
            {appointment.customerEmail}
          </p>
        )}
      </section>

      {appointment.notes && (
        <footer className="panel">
          <strong>Notes</strong>
          <p>{appointment.notes}</p>
        </footer>
      )}
    </article>
  );
}
