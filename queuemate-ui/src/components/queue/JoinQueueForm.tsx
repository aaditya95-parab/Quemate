import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type { Service } from "../../types/service";
import type { StaffMember } from "../../types/staff";
import type { JoinQueueRequest } from "../../types/queue";

interface JoinQueueFormProps {
  services: Service[];
  staffMembers: StaffMember[];
  isSubmitting: boolean;
  onSubmit: (request: JoinQueueRequest) => Promise<void>;
  onCancel: () => void;
}

export default function JoinQueueForm({
  services,
  staffMembers,
  isSubmitting,
  onSubmit,
  onCancel,
}: JoinQueueFormProps) {
  const [serviceId, setServiceId] = useState("");
  const [staffMemberId, setStaffMemberId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const eligibleStaff = useMemo(() => {
    if (!serviceId) {
      return [];
    }

    return staffMembers.filter(
      (staff) =>
        staff.isActive &&
        staff.services.some(
          (service) =>
            service.id === serviceId &&
            service.isActive,
        ),
    );
  }, [serviceId, staffMembers]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!serviceId) {
      setError("Select a service.");
      return;
    }

    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!customerPhone.trim()) {
      setError("Customer phone is required.");
      return;
    }

    await onSubmit({
      serviceId,
      staffMemberId: staffMemberId || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <header>
        <h2>Add walk-in customer</h2>
        <p>Create a queue token for a walk-in customer.</p>
      </header>

      <label>
        Service
        <select
          value={serviceId}
          onChange={(event) => {
            setServiceId(event.target.value);
            setStaffMemberId("");
          }}
          required
        >
          <option value="">Select service</option>

          {services
            .filter((service) => service.isActive)
            .map((service) => (
              <option
                key={service.id}
                value={service.id}
              >
                {service.name}
              </option>
            ))}
        </select>
      </label>

      <label>
        Preferred staff member
        <select
          value={staffMemberId}
          onChange={(event) =>
            setStaffMemberId(event.target.value)
          }
        >
          <option value="">Any available staff</option>

          {eligibleStaff.map((staff) => (
            <option
              key={staff.id}
              value={staff.id}
            >
              {staff.fullName}
            </option>
          ))}
        </select>
      </label>

      <label>
        Customer name
        <input
          value={customerName}
          onChange={(event) =>
            setCustomerName(event.target.value)
          }
          required
        />
      </label>

      <label>
        Customer phone
        <input
          type="tel"
          value={customerPhone}
          onChange={(event) =>
            setCustomerPhone(event.target.value)
          }
          required
        />
      </label>

      <label>
        Customer email
        <input
          type="email"
          value={customerEmail}
          onChange={(event) =>
            setCustomerEmail(event.target.value)
          }
        />
      </label>

      <label>
        Notes
        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          rows={3}
        />
      </label>

      {error && <p role="alert">{error}</p>}

      <footer>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Adding customer..."
            : "Join queue"}
        </button>
      </footer>
    </form>
  );
}