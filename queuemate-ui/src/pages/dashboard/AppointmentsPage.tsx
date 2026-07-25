import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  CalendarDays,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  getAppointments,
  updateAppointmentStatus,
} from "../../api/appointmentApi";
import AppointmentCard from "../../components/appointments/AppointmentCard";
import { useBusiness } from "../../context/BusinessContext";
import type {
  Appointment,
  AppointmentStatusValue,
} from "../../types/appointment";

function getTodayDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

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

export default function AppointmentsPage() {
  const {
    currentBusiness,
    currentBusinessId,
  } = useBusiness();

  const businessId = currentBusinessId ?? "";

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [selectedDate, setSelectedDate] =
    useState(getTodayDate());

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [isLoading, setIsLoading] = useState(true);

  const [updatingAppointmentId, setUpdatingAppointmentId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const loadAppointments = useCallback(async () => {
    if (!businessId) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getAppointments(
        businessId,
        selectedDate,
      );

      setAppointments(result);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not load appointments.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [businessId, selectedDate]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const filteredAppointments = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesStatus =
        statusFilter === "All" ||
        appointment.status === statusFilter;

      const matchesSearch =
        !search ||
        appointment.customerName
          .toLowerCase()
          .includes(search) ||
        appointment.customerPhone
          .toLowerCase()
          .includes(search) ||
        appointment.customerEmail
          ?.toLowerCase()
          .includes(search) ||
        appointment.serviceName
          .toLowerCase()
          .includes(search) ||
        appointment.staffName
          .toLowerCase()
          .includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [
    appointments,
    searchText,
    statusFilter,
  ]);

  async function handleStatusChange(
    appointment: Appointment,
    status: AppointmentStatusValue,
  ) {
    if (!businessId) {
      return;
    }

    setUpdatingAppointmentId(appointment.id);
    setError("");
    setSuccessMessage("");

    try {
      const updatedAppointment =
        await updateAppointmentStatus(
          businessId,
          appointment.id,
          { status },
        );

      setAppointments((currentAppointments) =>
        currentAppointments.map((item) =>
          item.id === updatedAppointment.id
            ? updatedAppointment
            : item,
        ),
      );

      setSuccessMessage(
        `Appointment marked as ${updatedAppointment.status}.`,
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not update appointment status.",
        ),
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  }

  const completedCount = appointments.filter(
    (item) => item.status === "Completed",
  ).length;

  const activeCount = appointments.filter(
    (item) =>
      item.status !== "Completed" &&
      item.status !== "Cancelled" &&
      item.status !== "NoShow",
  ).length;

  const cancelledCount = appointments.filter(
    (item) => item.status === "Cancelled",
  ).length;

  return (
    <main>
      <header>
        <div>
          <p>{currentBusiness?.name}</p>
          <h1>Appointments</h1>
          <p>
            View bookings and manage each customer’s
            appointment status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadAppointments()}
          disabled={isLoading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      {error && (
        <div role="alert">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {successMessage && (
        <div role="status">
          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section>
        <label>
          Appointment date

          <input
            type="date"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(event.target.value)
            }
          />
        </label>

        <label>
          <Search size={18} />

          <input
            type="search"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Search customer, service or staff"
          />
        </label>

        <label>
          Status

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">All statuses</option>
            <option value="Booked">Booked</option>
            <option value="Confirmed">Confirmed</option>
            <option value="CheckedIn">Checked in</option>
            <option value="InService">In service</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="NoShow">No show</option>
          </select>
        </label>
      </section>

      <section>
        <span>
          Total
          <strong>{appointments.length}</strong>
        </span>

        <span>
          Active
          <strong>{activeCount}</strong>
        </span>

        <span>
          Completed
          <strong>{completedCount}</strong>
        </span>

        <span>
          Cancelled
          <strong>{cancelledCount}</strong>
        </span>
      </section>

      {isLoading ? (
        <section>
          <p>Loading appointments...</p>
        </section>
      ) : filteredAppointments.length === 0 ? (
        <section>
          <CalendarDays size={38} />

          <h2>No appointments found</h2>

          <p>
            There are no matching appointments for the
            selected date.
          </p>
        </section>
      ) : (
        <section>
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isUpdating={
                updatingAppointmentId === appointment.id
              }
              onStatusChange={handleStatusChange}
            />
          ))}
        </section>
      )}
    </main>
  );
}