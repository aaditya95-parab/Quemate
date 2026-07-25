import {
  Mail,
  Pencil,
  Phone,
  Power,
} from "lucide-react";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import type { StaffMember } from "../../types/staff";
import { getInitials } from "../../utils/format";

interface StaffCardProps {
  staff: StaffMember;
  isUpdating: boolean;
  onEdit: (staff: StaffMember) => void;
  onToggleStatus: (staff: StaffMember) => void;
}

export default function StaffCard({
  staff,
  isUpdating,
  onEdit,
  onToggleStatus,
}: StaffCardProps) {
  return (
    <article className="entity-card">
      <header className="entity-card__header">
        <div className="user-chip">
          <span className="avatar">
            {getInitials(staff.fullName)}
          </span>
          <div>
            <strong>{staff.fullName}</strong>
            <span>{staff.jobTitle || "Staff member"}</span>
          </div>
        </div>

        <div className="toolbar">
          <StatusBadge
            status={staff.isActive ? "Active" : "Inactive"}
          />

          <Button
            icon={<Pencil size={17} />}
            onClick={() => onEdit(staff)}
            aria-label={`Edit ${staff.fullName}`}
            variant="ghost"
          />
        </div>
      </header>

      <section className="meta-list">
        {staff.email && (
          <p>
            <Mail size={16} />
            {staff.email}
          </p>
        )}

        {staff.phone && (
          <p>
            <Phone size={16} />
            {staff.phone}
          </p>
        )}
      </section>

      <section className="stack">
        <h4>Services</h4>

        {staff.services.length === 0 ? (
          <p>No services assigned.</p>
        ) : (
          <div className="tag-list">
            {staff.services.map((service) => (
              <span className="tag" key={service.id}>
                {service.name}
              </span>
            ))}
          </div>
        )}
      </section>

      <footer className="entity-card__footer">
        <Button
          icon={<Power size={17} />}
          onClick={() => onToggleStatus(staff)}
          isLoading={isUpdating}
          variant={staff.isActive ? "secondary" : "primary"}
        >
          {staff.isActive ? "Deactivate" : "Reactivate"}
        </Button>
      </footer>
    </article>
  );
}
