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
} from "lucide-react";
import {
  getAppointments,
  updateAppointmentStatus,
} from "../../api/appointmentApi";
import AppointmentCard from "../../components/appointments/AppointmentCard";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import StatCard from "../../components/ui/StatCard";
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
    <main className="module-page">
      <PageHeader
        eyebrow={currentBusiness?.name}
        title="Appointments"
        description="View bookings and manage each customer's appointment status."
        actions={
          <Button
            icon={<RefreshCw size={17} />}
            isLoading={isLoading}
            onClick={() => void loadAppointments()}
            variant="secondary"
          >
            Refresh
          </Button>
        }
      />

      {error && (
        <Alert tone="danger" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert tone="success" onDismiss={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      <section className="filter-bar">
        <Input
          label="Appointment date"
          type="date"
          value={selectedDate}
          onChange={(event) =>
            setSelectedDate(event.target.value)
          }
        />

        <SearchInput
          value={searchText}
          onChange={(event) =>
            setSearchText(event.target.value)
          }
          placeholder="Search customer, service or staff"
        />

        <Select
          label="Status"
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
        </Select>
      </section>

      <section className="stat-grid">
        <StatCard title="Total" value={appointments.length} />
        <StatCard title="Active" value={activeCount} />
        <StatCard title="Completed" value={completedCount} tone="success" />
        <StatCard title="Cancelled" value={cancelledCount} tone="danger" />
      </section>

      {isLoading ? (
        <LoadingState label="Loading appointments..." />
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={30} />}
          title="No appointments found"
          description="There are no matching appointments for the selected date."
        />
      ) : (
        <section className="card-grid">
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
