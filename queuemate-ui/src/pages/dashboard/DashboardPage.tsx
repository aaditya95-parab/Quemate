import {
  useCallback,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  ListOrdered,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../../api/dashboardApi";
import ActiveQueueItem from "../../components/dashboard/ActiveQueueItem";
import StatisticCard from "../../components/dashboard/StatisticCard";
import UpcomingAppointmentItem from "../../components/dashboard/UpcomingAppointmentItem";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import { useAuth } from "../../context/AuthContext";
import { useBusiness } from "../../context/BusinessContext";
import { useLiveQueue } from "../../hooks/useLiveQueue";
import type { DashboardData } from "../../types/dashboard";
import { formatInr, formatShortDate } from "../../utils/format";

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}

const emptyDashboardData: DashboardData = {
  statistics: {
    totalAppointments: 0,
    activeAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    waitingCustomers: 0,
    calledCustomers: 0,
    servingCustomers: 0,
    completedQueueEntries: 0,
    estimatedRevenue: 0,
  },
  upcomingAppointments: [],
  activeQueueEntries: [],
};

export default function DashboardPage() {
  const { user } = useAuth();

  const {
    currentBusiness,
    currentBusinessId,
  } = useBusiness();

  const businessId = currentBusinessId ?? "";

  const [dashboardData, setDashboardData] =
    useState<DashboardData>(emptyDashboardData);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!businessId) {
      setDashboardData(emptyDashboardData);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getDashboardData(businessId);
      setDashboardData(result);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not load dashboard statistics.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleQueueUpdated = useCallback(
    () => {
      void loadDashboard();
    },
    [loadDashboard],
  );

  useLiveQueue({
    businessId,
    onQueueUpdated: handleQueueUpdated,
  });

  const {
    statistics,
    upcomingAppointments,
    activeQueueEntries,
  } = dashboardData;

  const activeQueueCount =
    statistics.waitingCustomers +
    statistics.calledCustomers +
    statistics.servingCustomers;

  if (isLoading) {
    return (
      <main className="dashboard-page">
        <LoadingState label="Loading dashboard..." />
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <section className="hero-panel">
        <div className="stack">
          <p>{formatShortDate()}</p>
          <h1>
            Welcome back, {user?.fullName?.split(" ")[0] ?? "there"}
          </h1>
          <p>
            {currentBusiness?.name} is ready for today's bookings,
            walk-ins, and service updates.
          </p>
        </div>

        <Button
          icon={<RefreshCw size={17} />}
          onClick={() => void loadDashboard()}
          variant="secondary"
        >
          Refresh
        </Button>
      </section>

      {error && (
        <Alert tone="danger" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}

      <section className="stat-grid">
        <StatisticCard
          title="Today's appointments"
          value={statistics.totalAppointments}
          description={`${statistics.activeAppointments} currently active`}
          icon={CalendarDays}
        />

        <StatisticCard
          title="Active queue"
          value={activeQueueCount}
          description={`${statistics.waitingCustomers} customers waiting`}
          icon={ListOrdered}
        />

        <StatisticCard
          title="Completed today"
          value={
            statistics.completedAppointments +
            statistics.completedQueueEntries
          }
          description="Appointments and queue services"
          icon={CheckCircle2}
        />

        <StatisticCard
          title="Estimated revenue"
          value={formatInr(statistics.estimatedRevenue)}
          description="Excludes cancelled and no-show bookings"
          icon={IndianRupee}
        />
      </section>

      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>Quick actions</h2>
            <p>Open the most commonly used QueueMate modules.</p>
          </div>
        </header>

        <div className="toolbar">
          <Link
            className="ui-button ui-button--primary ui-button--md"
            to="/dashboard/live-queue"
          >
            <Plus size={18} />
            Add walk-in
          </Link>

          <Link
            className="ui-button ui-button--secondary ui-button--md"
            to="/dashboard/appointments"
          >
            <CalendarDays size={18} />
            View appointments
          </Link>

          <Link
            className="ui-button ui-button--secondary ui-button--md"
            to="/dashboard/services"
          >
            <Clock3 size={18} />
            Manage services
          </Link>

          <Link
            className="ui-button ui-button--secondary ui-button--md"
            to="/dashboard/staff"
          >
            <Users size={18} />
            Manage staff
          </Link>
        </div>
      </section>

      <section className="content-grid">
        <section className="panel">
          <header className="panel-header">
            <div>
              <h2>Upcoming appointments</h2>
              <p>The next scheduled customers for today.</p>
            </div>

            <Link to="/dashboard/appointments">
              View all
            </Link>
          </header>

          {upcomingAppointments.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={28} />}
              title="No upcoming appointments"
              description="Upcoming customer bookings will appear here."
            />
          ) : (
            <div className="stack">
              {upcomingAppointments.map(
                (appointment) => (
                  <UpcomingAppointmentItem
                    key={appointment.id}
                    appointment={appointment}
                  />
                ),
              )}
            </div>
          )}
        </section>

        <section className="panel">
          <header className="panel-header">
            <div>
              <h2>Active queue</h2>
              <p>Customers currently waiting or being served.</p>
            </div>

            <Link to="/dashboard/live-queue">
              Open live queue
            </Link>
          </header>

          {activeQueueEntries.length === 0 ? (
            <EmptyState
              icon={<ListOrdered size={28} />}
              title="The queue is empty"
              description="Walk-in customers will appear here after joining the queue."
            />
          ) : (
            <div className="stack">
              {activeQueueEntries.map((entry) => (
                <ActiveQueueItem
                  key={entry.id}
                  entry={entry}
                />
              ))}
            </div>
          )}
        </section>
      </section>

      <section className="panel">
        <header className="panel-header">
          <h2>Today's activity</h2>
        </header>

        <div className="stat-grid">
          <StatisticCard
            title="Waiting"
            value={statistics.waitingCustomers}
            description="Customers in line"
            icon={ListOrdered}
          />

          <StatisticCard
            title="Called"
            value={statistics.calledCustomers}
            description="Customers notified"
            icon={CalendarDays}
          />

          <StatisticCard
            title="Serving"
            value={statistics.servingCustomers}
            description="Currently in service"
            icon={Users}
          />

          <StatisticCard
            title="Cancelled"
            value={statistics.cancelledAppointments}
            description="Appointments cancelled"
            icon={IndianRupee}
          />
        </div>
      </section>
    </main>
  );
}
