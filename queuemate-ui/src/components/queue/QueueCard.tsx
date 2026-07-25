import {
  Clock3,
  Phone,
  UserRound,
} from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import type {
  QueueEntry,
  QueueStatusValue,
} from "../../types/queue";
import { queueStatusOptions } from "../../types/queue";
import { getInitials } from "../../utils/format";

interface QueueCardProps {
  entry: QueueEntry;
  isUpdating: boolean;
  onStatusChange: (
    entry: QueueEntry,
    status: QueueStatusValue,
  ) => void;
}

function formatTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function QueueCard({
  entry,
  isUpdating,
  onStatusChange,
}: QueueCardProps) {
  const selectedStatus =
    queueStatusOptions.find(
      (status) => status.label === entry.status,
    )?.value ?? 1;

  return (
    <article className={`entity-card queue-card--${entry.status}`}>
      <header className="entity-card__header">
        <div>
          <strong className="queue-token">{entry.tokenNumber}</strong>
          <StatusBadge status={entry.status} />
        </div>

        <select
          value={selectedStatus}
          disabled={isUpdating}
          onChange={(event) =>
            onStatusChange(
              entry,
              Number(event.target.value) as QueueStatusValue,
            )
          }
        >
          {queueStatusOptions.map((status) => (
            <option
              key={status.value}
              value={status.value}
            >
              {status.label}
            </option>
          ))}
        </select>
      </header>

      <section className="stack">
        <div className="user-chip">
          <span className="avatar">
            {getInitials(entry.customerName)}
          </span>
          <div>
            <strong>{entry.customerName}</strong>
            <span>{entry.serviceName}</span>
          </div>
        </div>

        <div className="meta-list">
        <p>
          <Phone size={16} />
          {entry.customerPhone}
        </p>

        <p>
          <Clock3 size={16} />
          Joined at {formatTime(entry.joinedAtUtc)}
        </p>
        </div>
      </section>

      <section className="entity-row">
        <strong>{entry.serviceName}</strong>

        <p>
          <UserRound size={16} />
          {entry.staffName ?? "Not assigned"}
        </p>
      </section>

      <footer className="tag-list">
        {entry.calledAtUtc && (
          <span className="tag">
            Called: {formatTime(entry.calledAtUtc)}
          </span>
        )}

        {entry.serviceStartedAtUtc && (
          <span className="tag">
            Started: {formatTime(entry.serviceStartedAtUtc)}
          </span>
        )}

        {entry.completedAtUtc && (
          <span className="tag">
            Completed: {formatTime(entry.completedAtUtc)}
          </span>
        )}
      </footer>
    </article>
  );
}
