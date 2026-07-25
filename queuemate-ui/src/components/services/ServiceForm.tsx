import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import type {
  CreateServiceRequest,
  Service,
  UpdateServiceRequest,
} from "../../types/service";

interface ServiceFormProps {
  service?: Service | null;
  isSubmitting: boolean;
  onSubmit: (
    request: CreateServiceRequest | UpdateServiceRequest,
  ) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  name: string;
  description: string;
  durationMinutes: string;
  price: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  durationMinutes: "30",
  price: "0",
  isActive: true,
};

export default function ServiceForm({
  service,
  isSubmitting,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [validationError, setValidationError] =
    useState("");

  useEffect(() => {
    if (!service) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: service.name,
      description: service.description ?? "",
      durationMinutes: String(service.durationMinutes),
      price: String(service.price),
      isActive: service.isActive,
    });
  }, [service]);

  function updateField(
    field: keyof FormState,
    value: string | boolean,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setValidationError("");

    const durationMinutes = Number(form.durationMinutes);
    const price = Number(form.price);

    if (!form.name.trim()) {
      setValidationError("Service name is required.");
      return;
    }

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 5 ||
      durationMinutes > 1440
    ) {
      setValidationError(
        "Duration must be between 5 and 1440 minutes.",
      );
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setValidationError(
        "Price must be zero or greater.",
      );
      return;
    }

    if (service) {
      await onSubmit({
        name: form.name.trim(),
        description:
          form.description.trim() || undefined,
        durationMinutes,
        price,
        isActive: form.isActive,
      });

      return;
    }

    await onSubmit({
      name: form.name.trim(),
      description:
        form.description.trim() || undefined,
      durationMinutes,
      price,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <header>
        <h2>
          {service ? "Edit service" : "Add service"}
        </h2>

        <p>
          Configure the service duration, description,
          and customer price.
        </p>
      </header>

      <label>
        Service name
        <input
          value={form.name}
          onChange={(event) =>
            updateField("name", event.target.value)
          }
          placeholder="Premium Haircut"
          maxLength={120}
          required
        />
      </label>

      <label>
        Description
        <textarea
          value={form.description}
          onChange={(event) =>
            updateField(
              "description",
              event.target.value,
            )
          }
          placeholder="Haircut, wash and basic styling"
          maxLength={500}
          rows={4}
        />
      </label>

      <label>
        Duration in minutes
        <input
          type="number"
          value={form.durationMinutes}
          onChange={(event) =>
            updateField(
              "durationMinutes",
              event.target.value,
            )
          }
          min={5}
          max={1440}
          step={5}
          required
        />
      </label>

      <label>
        Price
        <input
          type="number"
          value={form.price}
          onChange={(event) =>
            updateField("price", event.target.value)
          }
          min={0}
          step="0.01"
          required
        />
      </label>

      {service && (
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

          Service is active
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
            : service
              ? "Update service"
              : "Create service"}
        </button>
      </footer>
    </form>
  );
}