import {
  Clock3,
  UserRound,
} from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import type { QueueEntry } from "../../types/queue";
import { getInitials } from "../../utils/format";

interface ActiveQueueItemProps {
  entry: QueueEntry;
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActiveQueueItem({
  entry,
}: ActiveQueueItemProps) {
  return (
    <article className="entity-card">
      <div className="entity-card__header">
        <div className="user-chip">
          <span className="avatar">
            {getInitials(entry.customerName)}
          </span>
          <div>
            <strong>{entry.customerName}</strong>
            <span>{entry.serviceName}</span>
          </div>
        </div>

        <StatusBadge status={entry.status} />
      </div>

      <div className="entity-row">
        <strong className="queue-token">
          {entry.tokenNumber}
        </strong>
        <span className="meta-pill">
          <Clock3 size={15} />
          {formatTime(entry.joinedAtUtc)}
        </span>
      </div>

      <div className="meta-list">
        <p>
          <UserRound size={15} />
          {entry.staffName ?? "Not assigned"}
        </p>
      </div>
    </article>
  );
}
