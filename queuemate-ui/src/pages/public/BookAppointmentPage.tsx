import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import axios from "axios";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
} from "lucide-react";
import {
  createAppointment,
  getAvailableSlots,
} from "../../api/appointmentApi";
import {
  getPublicServices,
  getPublicStaff,
} from "../../api/appointmentApi";
import type {
  Appointment,
  AvailableSlot,
} from "../../types/appointment";
import type { Service } from "../../types/service";
import type { StaffMember } from "../../types/staff";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";

interface BookAppointmentPageProps {
  businessId: string;
}

function getTomorrowDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}

export default function BookAppointmentPage({
  businessId,
}: BookAppointmentPageProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [staffMembers, setStaffMembers] =
    useState<StaffMember[]>([]);

  const [availableSlots, setAvailableSlots] =
    useState<AvailableSlot[]>([]);

  const [selectedServiceId, setSelectedServiceId] =
    useState("");

  const [selectedStaffId, setSelectedStaffId] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState(getTomorrowDate());

  const [selectedSlot, setSelectedSlot] =
    useState<AvailableSlot | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [createdAppointment, setCreatedAppointment] =
    useState<Appointment | null>(null);

  const [isLoadingOptions, setIsLoadingOptions] =
    useState(true);

  const [isLoadingSlots, setIsLoadingSlots] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      setIsLoadingOptions(true);
      setError("");

      try {
       const [serviceResult, staffResult] =
  await Promise.all([
    getPublicServices(businessId),
    getPublicStaff(businessId),
  ]);

        setServices(
          serviceResult.filter(
            (service) => service.isActive,
          ),
        );

        setStaffMembers(
          staffResult.filter(
            (staff) => staff.isActive,
          ),
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Could not load booking options.",
          ),
        );
      } finally {
        setIsLoadingOptions(false);
      }
    }

    void loadOptions();
  }, [businessId]);

  const selectedService = services.find(
    (service) => service.id === selectedServiceId,
  );

  const eligibleStaff = useMemo(() => {
    if (!selectedServiceId) {
      return [];
    }

    return staffMembers.filter((staff) =>
      staff.services.some(
        (service) =>
          service.id === selectedServiceId &&
          service.isActive,
      ),
    );
  }, [
    staffMembers,
    selectedServiceId,
  ]);

  useEffect(() => {
    const staffStillEligible = eligibleStaff.some(
      (staff) => staff.id === selectedStaffId,
    );

    if (!staffStillEligible) {
      setSelectedStaffId("");
    }

    setAvailableSlots([]);
    setSelectedSlot(null);
  }, [
    eligibleStaff,
    selectedStaffId,
    selectedServiceId,
  ]);

  async function loadSlots() {
    if (
      !selectedServiceId ||
      !selectedStaffId ||
      !selectedDate
    ) {
      setError(
        "Select a service, staff member and date.",
      );
      return;
    }

    setIsLoadingSlots(true);
    setError("");
    setSelectedSlot(null);

    try {
      const result = await getAvailableSlots(
        businessId,
        selectedServiceId,
        selectedStaffId,
        selectedDate,
      );

      setAvailableSlots(result);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not load available slots.",
        ),
      );
    } finally {
      setIsLoadingSlots(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedSlot) {
      setError("Select an appointment slot.");
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

    setIsSubmitting(true);
    setError("");

    try {
      const appointment = await createAppointment(
        businessId,
        {
          serviceId: selectedServiceId,
          staffMemberId: selectedStaffId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail:
            customerEmail.trim() || undefined,
          startDateTimeUtc:
            selectedSlot.startDateTimeUtc,
          notes: notes.trim() || undefined,
        },
      );

      setCreatedAppointment(appointment);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not create the appointment.",
        ),
      );

      await loadSlots();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdAppointment) {
    return (
      <main className="booking-shell public-page">
        <section className="panel stack">
          <CheckCircle2 size={48} />

          <h1>Appointment confirmed</h1>

          <p>
            Your appointment has been booked successfully.
          </p>

          <dl className="panel stack">
            <div>
              <dt>Service</dt>
              <dd>{createdAppointment.serviceName}</dd>
            </div>

            <div>
              <dt>Staff member</dt>
              <dd>{createdAppointment.staffName}</dd>
            </div>

            <div>
              <dt>Date and time</dt>
              <dd>
                {new Date(
                  createdAppointment.startDateTimeUtc,
                ).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </dd>
            </div>

            <div>
              <dt>Price</dt>
              <dd>
                ₹
                {createdAppointment.priceAtBooking.toLocaleString(
                  "en-IN",
                )}
              </dd>
            </div>

            <div>
              <dt>Appointment ID</dt>
              <dd>{createdAppointment.id}</dd>
            </div>
          </dl>

          <Button
            onClick={() => {
              setCreatedAppointment(null);
              setSelectedSlot(null);
              setAvailableSlots([]);
              setCustomerName("");
              setCustomerPhone("");
              setCustomerEmail("");
              setNotes("");
            }}
          >
            Book another appointment
          </Button>
        </section>
      </main>
    );
  }

  if (isLoadingOptions) {
    return (
      <main className="booking-shell public-page">
        <LoadingState label="Loading booking options..." />
      </main>
    );
  }

  return (
    <main className="booking-shell public-page">
      <header className="hero-panel">
        <div className="stack">
        <p>QueueMate booking</p>
        <h1>Book an appointment</h1>

        <p>
          Choose a service, staff member and available
          appointment time.
        </p>
        </div>
      </header>

      {error && (
        <Alert tone="danger" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}

      <form className="content-grid" onSubmit={handleSubmit}>
        <section className="panel stack">
          <h2>1. Select a service</h2>

          <div className="choice-grid">
            {services.map((service) => (
              <button
                className="choice-card"
                key={service.id}
                type="button"
                aria-pressed={
                  selectedServiceId === service.id
                }
                onClick={() => {
                  setSelectedServiceId(service.id);
                  setSelectedStaffId("");
                }}
              >
                <strong>{service.name}</strong>

                <span>
                  <Clock3 size={15} />
                  {service.durationMinutes} minutes
                </span>

                <span>
                  <IndianRupee size={15} />
                  {service.price.toLocaleString("en-IN")}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel stack">
          <h2>2. Select a staff member</h2>

          {!selectedServiceId ? (
            <p>Select a service first.</p>
          ) : eligibleStaff.length === 0 ? (
            <p>
              No active staff members provide this service.
            </p>
          ) : (
            <select
              value={selectedStaffId}
              onChange={(event) =>
                setSelectedStaffId(event.target.value)
              }
              required
            >
              <option value="">
                Select staff member
              </option>

              {eligibleStaff.map((staff) => (
                <option
                  key={staff.id}
                  value={staff.id}
                >
                  {staff.fullName}
                  {staff.jobTitle
                    ? ` — ${staff.jobTitle}`
                    : ""}
                </option>
              ))}
            </select>
          )}
        </section>

        <section className="panel stack">
          <h2>3. Choose a date</h2>

          <label>
            <CalendarDays size={17} />

            <input
              type="date"
              value={selectedDate}
              min={new Date()
                .toISOString()
                .slice(0, 10)}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setAvailableSlots([]);
                setSelectedSlot(null);
              }}
              required
            />
          </label>

          <Button
            onClick={() => void loadSlots()}
            disabled={
              isLoadingSlots ||
              !selectedServiceId ||
              !selectedStaffId
            }
          >
            {isLoadingSlots
              ? "Checking availability..."
              : "Show available slots"}
          </Button>
        </section>

        <section className="panel stack">
          <h2>4. Select a time</h2>

          {availableSlots.length === 0 ? (
            <p>
              Load available slots after selecting the
              service, staff member and date.
            </p>
          ) : (
            <div className="tag-list">
              {availableSlots.map((slot) => (
                <button
                  className="time-slot"
                  key={slot.startDateTimeUtc}
                  type="button"
                  aria-pressed={
                    selectedSlot?.startDateTimeUtc ===
                    slot.startDateTimeUtc
                  }
                  onClick={() =>
                    setSelectedSlot(slot)
                  }
                >
                  {slot.localStartTime}
                  {" – "}
                  {slot.localEndTime}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="panel stack">
          <h2>5. Your details</h2>

          <label>
            Full name
            <input
              value={customerName}
              onChange={(event) =>
                setCustomerName(event.target.value)
              }
              maxLength={120}
              required
            />
          </label>

          <label>
            Phone
            <input
              type="tel"
              value={customerPhone}
              onChange={(event) =>
                setCustomerPhone(event.target.value)
              }
              maxLength={30}
              required
            />
          </label>

          <label>
            Email
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
              maxLength={500}
              rows={3}
            />
          </label>
        </section>

        {selectedService && (
          <section className="panel stack">
            <h2>Booking summary</h2>

            <p>{selectedService.name}</p>
            <p>
              {selectedService.durationMinutes} minutes
            </p>
            <p>
              ₹
              {selectedService.price.toLocaleString(
                "en-IN",
              )}
            </p>

            {selectedSlot && (
              <p>
                {selectedSlot.localStartTime}
                {" – "}
                {selectedSlot.localEndTime}
              </p>
            )}
          </section>
        )}

        <Button
          className="full-span"
          isLoading={isSubmitting}
          type="submit"
          disabled={
            isSubmitting ||
            !selectedSlot ||
            !selectedServiceId ||
            !selectedStaffId
          }
        >
          Confirm appointment
        </Button>
      </form>
    </main>
  );
}
