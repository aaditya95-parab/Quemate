import {
  Clock3,
  IndianRupee,
  Pencil,
  Power,
} from "lucide-react";
import type { Service } from "../../types/service";

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
    <article>
      <header>
        <div>
          <h3>{service.name}</h3>

          <span>
            {service.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onEdit(service)}
          aria-label={`Edit ${service.name}`}
        >
          <Pencil size={17} />
        </button>
      </header>

      <p>
        {service.description ||
          "No description added."}
      </p>

      <div>
        <span>
          <Clock3 size={17} />
          {service.durationMinutes} minutes
        </span>

        <span>
          <IndianRupee size={17} />
          {service.price.toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      <footer>
        <button
          type="button"
          onClick={() => onToggleStatus(service)}
          disabled={isUpdating}
        >
          <Power size={17} />

          {isUpdating
            ? "Updating..."
            : service.isActive
              ? "Deactivate"
              : "Reactivate"}
        </button>
      </footer>
    </article>
  );
}