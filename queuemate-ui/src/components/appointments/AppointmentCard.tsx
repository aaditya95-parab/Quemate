import {
  CalendarDays,
  Clock3,
  IndianRupee,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import type {
  Appointment,
  AppointmentStatusValue,
} from "../../types/appointment";
import { appointmentStatusOptions } from "../../types/appointment";

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
    <article>
      <header>
        <div>
          <h3>{appointment.customerName}</h3>
          <span>{appointment.status}</span>
        </div>

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
      </header>

      <section>
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

      <section>
        <h4>{appointment.serviceName}</h4>

        <p>
          <IndianRupee size={16} />
          {appointment.priceAtBooking.toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </p>
      </section>

      <section>
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
        <footer>
          <strong>Notes</strong>
          <p>{appointment.notes}</p>
        </footer>
      )}
    </article>
  );
}