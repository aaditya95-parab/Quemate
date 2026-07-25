import {
  Clock3,
  IndianRupee,
  Pencil,
  Power,
  Sparkles,
} from "lucide-react";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import type { Service } from "../../types/service";
import { formatInr } from "../../utils/format";

interface ServiceCardProps {
  service: Service;
  isUpdating: boolean;
  onEdit: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
}

export default function ServiceCard({
  service,
  isUpdating,
  onEdit,
  onToggleStatus,
}: ServiceCardProps) {
  return (
    <article className="entity-card">
      <header className="entity-card__header">
        <div>
          <span className="stat-card__icon tone-primary">
            <Sparkles size={18} />
          </span>
          <h3>{service.name}</h3>
        </div>

        <div className="toolbar">
          <StatusBadge
            status={service.isActive ? "Active" : "Inactive"}
          />
          <Button
          icon={<Pencil size={17} />}
          onClick={() => onEdit(service)}
          aria-label={`Edit ${service.name}`}
          variant="ghost"
        />
        </div>
      </header>

      <p>
        {service.description ||
          "No description added."}
      </p>

      <div className="meta-list">
        <p>
          <Clock3 size={17} />
          {service.durationMinutes} minutes
        </p>

        <p>
          <IndianRupee size={17} />
          {formatInr(service.price)}
        </p>
      </div>

      <footer className="entity-card__footer">
        <Button
          icon={<Power size={17} />}
          onClick={() => onToggleStatus(service)}
          isLoading={isUpdating}
          variant={service.isActive ? "secondary" : "primary"}
        >
          {service.isActive ? "Deactivate" : "Reactivate"}
        </Button>
      </footer>
    </article>
  );
}
