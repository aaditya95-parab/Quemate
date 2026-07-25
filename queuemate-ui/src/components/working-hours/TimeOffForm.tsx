import {
  useState,
  type FormEvent,
} from "react";
import type { CreateStaffTimeOffRequest } from "../../types/workingHours";

interface TimeOffFormProps {
  isSubmitting: boolean;
  onSubmit: (
    request: CreateStaffTimeOffRequest,
  ) => Promise<void>;
}

export default function TimeOffForm({
  isSubmitting,
  onSubmit,
}: TimeOffFormProps) {
  const [startDateTime, setStartDateTime] =
    useState("");

  const [endDateTime, setEndDateTime] =
    useState("");

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!startDateTime || !endDateTime) {
      setError("Start and end date/time are required.");
      return;
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (end <= start) {
      setError(
        "Time-off end must be after the start.",
      );

      return;
    }

    await onSubmit({
      startDateTimeUtc: start.toISOString(),
      endDateTimeUtc: end.toISOString(),
      reason: reason.trim() || undefined,
    });

    setStartDateTime("");
    setEndDateTime("");
    setReason("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add time off</h3>

      <label>
        Start date and time
        <input
          type="datetime-local"
          value={startDateTime}
          onChange={(event) =>
            setStartDateTime(event.target.value)
          }
          required
        />
      </label>

      <label>
        End date and time
        <input
          type="datetime-local"
          value={endDateTime}
          onChange={(event) =>
            setEndDateTime(event.target.value)
          }
          required
        />
      </label>

      <label>
        Reason
        <textarea
          value={reason}
          onChange={(event) =>
            setReason(event.target.value)
          }
          placeholder="Personal leave"
          maxLength={300}
          rows={3}
        />
      </label>

      {error && <p role="alert">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Adding time off..."
          : "Add time off"}
      </button>
    </form>
  );
}