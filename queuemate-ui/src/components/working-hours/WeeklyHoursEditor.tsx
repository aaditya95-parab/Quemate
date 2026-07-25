import { useEffect, useState } from "react";
import type {
  WorkingHour,
  WorkingHourRequest,
} from "../../types/workingHours";

interface WeeklyHoursEditorProps {
  hours: WorkingHour[];
  isSaving: boolean;
  disabled?: boolean;
  onSave: (hours: WorkingHourRequest[]) => Promise<void>;
}

interface DayForm {
  dayOfWeek: number;
  label: string;
  startTime: string;
  endTime: string;
  isClosed: boolean;
}

const days: DayForm[] = [
  {
    dayOfWeek: 1,
    label: "Monday",
    startTime: "09:00",
    endTime: "18:00",
    isClosed: false,
  },
  {
    dayOfWeek: 2,
    label: "Tuesday",
    startTime: "09:00",
    endTime: "18:00",
    isClosed: false,
  },
  {
    dayOfWeek: 3,
    label: "Wednesday",
    startTime: "09:00",
    endTime: "18:00",
    isClosed: false,
  },
  {
    dayOfWeek: 4,
    label: "Thursday",
    startTime: "09:00",
    endTime: "18:00",
    isClosed: false,
  },
  {
    dayOfWeek: 5,
    label: "Friday",
    startTime: "09:00",
    endTime: "18:00",
    isClosed: false,
  },
  {
    dayOfWeek: 6,
    label: "Saturday",
    startTime: "10:00",
    endTime: "16:00",
    isClosed: false,
  },
  {
    dayOfWeek: 0,
    label: "Sunday",
    startTime: "09:00",
    endTime: "18:00",
    isClosed: true,
  },
];

function toInputTime(value: string | null): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 5);
}

function toApiTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

export default function WeeklyHoursEditor({
  hours,
  isSaving,
  disabled = false,
  onSave,
}: WeeklyHoursEditorProps) {
  const [formDays, setFormDays] =
    useState<DayForm[]>(days);

  const [validationError, setValidationError] =
    useState("");

  useEffect(() => {
    if (hours.length === 0) {
      setFormDays(days);
      return;
    }

    setFormDays(
      days.map((defaultDay) => {
        const existing = hours.find(
          (hour) =>
            hour.dayOfWeek === defaultDay.dayOfWeek,
        );

        if (!existing) {
          return defaultDay;
        }

        return {
          ...defaultDay,
          startTime:
            toInputTime(existing.startTime) ||
            defaultDay.startTime,
          endTime:
            toInputTime(existing.endTime) ||
            defaultDay.endTime,
          isClosed: existing.isClosed,
        };
      }),
    );
  }, [hours]);

  function updateDay(
    dayOfWeek: number,
    changes: Partial<DayForm>,
  ) {
    setFormDays((currentDays) =>
      currentDays.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              ...changes,
            }
          : day,
      ),
    );
  }

  async function handleSave() {
    setValidationError("");

    for (const day of formDays) {
      if (day.isClosed) {
        continue;
      }

      if (!day.startTime || !day.endTime) {
        setValidationError(
          `${day.label}: start and end times are required.`,
        );

        return;
      }

      if (day.startTime >= day.endTime) {
        setValidationError(
          `${day.label}: start time must be before end time.`,
        );

        return;
      }
    }

    const request: WorkingHourRequest[] =
      formDays.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        startTime: day.isClosed
          ? null
          : toApiTime(day.startTime),
        endTime: day.isClosed
          ? null
          : toApiTime(day.endTime),
        isClosed: day.isClosed,
      }));

    await onSave(request);
  }

  return (
    <section>
      <div>
        {formDays.map((day) => (
          <div key={day.dayOfWeek}>
            <div>
              <strong>{day.label}</strong>

              <label>
                <input
                  type="checkbox"
                  checked={!day.isClosed}
                  disabled={disabled}
                  onChange={(event) =>
                    updateDay(day.dayOfWeek, {
                      isClosed: !event.target.checked,
                    })
                  }
                />

                Open
              </label>
            </div>

            {day.isClosed ? (
              <p>Closed</p>
            ) : (
              <div>
                <label>
                  Opens
                  <input
                    type="time"
                    value={day.startTime}
                    disabled={disabled}
                    onChange={(event) =>
                      updateDay(day.dayOfWeek, {
                        startTime:
                          event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Closes
                  <input
                    type="time"
                    value={day.endTime}
                    disabled={disabled}
                    onChange={(event) =>
                      updateDay(day.dayOfWeek, {
                        endTime:
                          event.target.value,
                      })
                    }
                  />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      {validationError && (
        <p role="alert">{validationError}</p>
      )}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={disabled || isSaving}
      >
        {isSaving
          ? "Saving schedule..."
          : "Save schedule"}
      </button>
    </section>
  );
}
