import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import type { Service } from "../../types/service";
import type {
  CreateStaffRequest,
  StaffMember,
  UpdateStaffRequest,
} from "../../types/staff";

interface StaffFormProps {
  staff?: StaffMember | null;
  services: Service[];
  isSubmitting: boolean;
  onSubmit: (
    staffRequest: CreateStaffRequest | UpdateStaffRequest,
    serviceIds: string[],
  ) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  isActive: boolean;
  serviceIds: string[];
}

const emptyForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  jobTitle: "",
  isActive: true,
  serviceIds: [],
};

export default function StaffForm({
  staff,
  services,
  isSubmitting,
  onSubmit,
  onCancel,
}: StaffFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [validationError, setValidationError] =
    useState("");

  useEffect(() => {
    if (!staff) {
      setForm(emptyForm);
      return;
    }

    setForm({
      fullName: staff.fullName,
      email: staff.email ?? "",
      phone: staff.phone ?? "",
      jobTitle: staff.jobTitle ?? "",
      isActive: staff.isActive,
      serviceIds: staff.services.map(
        (service) => service.id,
      ),
    });
  }, [staff]);

  function updateField(
    field: keyof FormState,
    value: string | boolean | string[],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function toggleService(serviceId: string) {
    setForm((currentForm) => {
      const alreadySelected =
        currentForm.serviceIds.includes(serviceId);

      return {
        ...currentForm,
        serviceIds: alreadySelected
          ? currentForm.serviceIds.filter(
              (id) => id !== serviceId,
            )
          : [...currentForm.serviceIds, serviceId],
      };
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setValidationError("");

    if (!form.fullName.trim()) {
      setValidationError("Staff name is required.");
      return;
    }

    if (form.email && !form.email.includes("@")) {
      setValidationError("Enter a valid email address.");
      return;
    }

    if (staff) {
      const request: UpdateStaffRequest = {
        fullName: form.fullName.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        jobTitle: form.jobTitle.trim() || undefined,
        isActive: form.isActive,
      };

      await onSubmit(request, form.serviceIds);
      return;
    }

    const request: CreateStaffRequest = {
      fullName: form.fullName.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      jobTitle: form.jobTitle.trim() || undefined,
      serviceIds: form.serviceIds,
    };

    await onSubmit(request, form.serviceIds);
  }

  const activeServices = services.filter(
    (service) => service.isActive,
  );

  return (
    <form onSubmit={handleSubmit}>
      <header>
        <h2>
          {staff ? "Edit staff member" : "Add staff member"}
        </h2>

        <p>
          Add staff details and select the services they
          can provide.
        </p>
      </header>

      <label>
        Full name
        <input
          value={form.fullName}
          onChange={(event) =>
            updateField(
              "fullName",
              event.target.value,
            )
          }
          placeholder="Rahul Sharma"
          maxLength={120}
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={(event) =>
            updateField("email", event.target.value)
          }
          placeholder="rahul@business.com"
        />
      </label>

      <label>
        Phone
        <input
          type="tel"
          value={form.phone}
          onChange={(event) =>
            updateField("phone", event.target.value)
          }
          placeholder="9876543210"
        />
      </label>

      <label>
        Job title
        <input
          value={form.jobTitle}
          onChange={(event) =>
            updateField(
              "jobTitle",
              event.target.value,
            )
          }
          placeholder="Senior Stylist"
        />
      </label>

      <fieldset>
        <legend>Assigned services</legend>

        {activeServices.length === 0 ? (
          <p>
            No active services are available. Create a service
            before assigning it to staff.
          </p>
        ) : (
          activeServices.map((service) => (
            <label key={service.id}>
              <input
                type="checkbox"
                checked={form.serviceIds.includes(
                  service.id,
                )}
                onChange={() =>
                  toggleService(service.id)
                }
              />

              <span>
                <strong>{service.name}</strong>
                <small>
                  {service.durationMinutes} minutes · ₹
                  {service.price.toLocaleString("en-IN")}
                </small>
              </span>
            </label>
          ))
        )}
      </fieldset>

      {staff && (
        <label>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              updateField(
                "isActive",
                event.target.checked,
              )
            }
          />

          Staff member is active
        </label>
      )}

      {validationError && (
        <p role="alert">{validationError}</p>
      )}

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
            ? "Saving..."
            : staff
              ? "Update staff"
              : "Add staff"}
        </button>
      </footer>
    </form>
  );
}