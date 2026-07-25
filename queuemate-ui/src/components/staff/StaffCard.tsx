import {
  Mail,
  Pencil,
  Phone,
  Power,
  UserRound,
} from "lucide-react";
import type { StaffMember } from "../../types/staff";

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
    <article>
      <header>
        <div>
          <UserRound size={20} />

          <div>
            <h3>{staff.fullName}</h3>
            <p>{staff.jobTitle || "Staff member"}</p>
          </div>
        </div>

        <div>
          <span>
            {staff.isActive ? "Active" : "Inactive"}
          </span>

          <button
            type="button"
            onClick={() => onEdit(staff)}
            aria-label={`Edit ${staff.fullName}`}
          >
            <Pencil size={17} />
          </button>
        </div>
      </header>

      <section>
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

      <section>
        <h4>Services</h4>

        {staff.services.length === 0 ? (
          <p>No services assigned.</p>
        ) : (
          <div>
            {staff.services.map((service) => (
              <span key={service.id}>
                {service.name}
              </span>
            ))}
          </div>
        )}
      </section>

      <footer>
        <button
          type="button"
          onClick={() => onToggleStatus(staff)}
          disabled={isUpdating}
        >
          <Power size={17} />

          {isUpdating
            ? "Updating..."
            : staff.isActive
              ? "Deactivate"
              : "Reactivate"}
        </button>
      </footer>
    </article>
  );
}