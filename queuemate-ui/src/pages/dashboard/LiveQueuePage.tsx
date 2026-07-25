import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  ListOrdered,
  Plus,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import {
  callNextCustomer,
  getLiveQueue,
  joinQueue,
  updateQueueStatus,
} from "../../api/queueApi";
import { getServices } from "../../api/serviceApi";
import { getStaff } from "../../api/staffApi";
import JoinQueueForm from "../../components/queue/JoinQueueForm";
import QueueCard from "../../components/queue/QueueCard";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import StatCard from "../../components/ui/StatCard";
import { useBusiness } from "../../context/BusinessContext";
import { useLiveQueue } from "../../hooks/useLiveQueue";
import type { Service } from "../../types/service";
import type { StaffMember } from "../../types/staff";
import type {
  JoinQueueRequest,
  QueueEntry,
  QueueStatusValue,
} from "../../types/queue";

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}

export default function LiveQueuePage() {
  const {
    currentBusiness,
    currentBusinessId,
  } = useBusiness();

  const businessId = currentBusinessId ?? "";

  const [queueEntries, setQueueEntries] =
    useState<QueueEntry[]>([]);

  const [services, setServices] = useState<Service[]>([]);
  const [staffMembers, setStaffMembers] =
    useState<StaffMember[]>([]);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("Active");

  const [serviceFilter, setServiceFilter] =
    useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [updatingEntryId, setUpdatingEntryId] =
    useState<string | null>(null);

  const [isCallingNext, setIsCallingNext] =
    useState(false);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const loadQueue = useCallback(async () => {
    if (!businessId) {
      setQueueEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getLiveQueue(businessId);
      setQueueEntries(result);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not load the live queue.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  const loadReferenceData = useCallback(async () => {
    if (!businessId) {
      return;
    }

    try {
      const [serviceResult, staffResult] =
        await Promise.all([
          getServices(businessId),
          getStaff(businessId),
        ]);

      setServices(serviceResult);
      setStaffMembers(staffResult);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not load services and staff.",
        ),
      );
    }
  }, [businessId]);

  useEffect(() => {
    void loadQueue();
    void loadReferenceData();
  }, [loadQueue, loadReferenceData]);

  const handleQueueUpdated = useCallback(
    () => {
      void loadQueue();
    },
    [loadQueue],
  );

  useLiveQueue({
    businessId,
    onQueueUpdated: handleQueueUpdated,
  });

  const filteredEntries = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return queueEntries.filter((entry) => {
      const matchesSearch =
        !search ||
        entry.tokenNumber.toLowerCase().includes(search) ||
        entry.customerName.toLowerCase().includes(search) ||
        entry.customerPhone.toLowerCase().includes(search) ||
        entry.serviceName.toLowerCase().includes(search) ||
        entry.staffName?.toLowerCase().includes(search);

      const activeStatuses = [
        "Waiting",
        "Called",
        "Serving",
      ];

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" &&
          activeStatuses.includes(entry.status)) ||
        entry.status === statusFilter;

      const matchesService =
        !serviceFilter ||
        entry.serviceId === serviceFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesService
      );
    });
  }, [
    queueEntries,
    searchText,
    statusFilter,
    serviceFilter,
  ]);

  async function handleJoinQueue(
    request: JoinQueueRequest,
  ) {
    if (!businessId) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const createdEntry = await joinQueue(
        businessId,
        request,
      );

      setQueueEntries((currentEntries) =>
        [...currentEntries, createdEntry].sort(
          (first, second) =>
            first.dailySequenceNumber -
            second.dailySequenceNumber,
        ),
      );

      setSuccessMessage(
        `${createdEntry.tokenNumber} added to the queue.`,
      );

      setIsFormOpen(false);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not add customer to the queue.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(
    entry: QueueEntry,
    status: QueueStatusValue,
  ) {
    if (!businessId) {
      return;
    }

    setUpdatingEntryId(entry.id);
    setError("");
    setSuccessMessage("");

    try {
      const updatedEntry = await updateQueueStatus(
        businessId,
        entry.id,
        {
          status,
          staffMemberId:
            entry.staffMemberId ?? undefined,
        },
      );

      setQueueEntries((currentEntries) =>
        currentEntries.map((item) =>
          item.id === updatedEntry.id
            ? updatedEntry
            : item,
        ),
      );

      setSuccessMessage(
        `${updatedEntry.tokenNumber} marked as ${updatedEntry.status}.`,
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not update queue status.",
        ),
      );
    } finally {
      setUpdatingEntryId(null);
    }
  }

  async function handleCallNext() {
    if (!businessId) {
      return;
    }

    setIsCallingNext(true);
    setError("");
    setSuccessMessage("");

    try {
      const nextEntry = await callNextCustomer(
        businessId,
        serviceFilter || undefined,
      );

      setQueueEntries((currentEntries) =>
        currentEntries.map((entry) =>
          entry.id === nextEntry.id
            ? nextEntry
            : entry,
        ),
      );

      setSuccessMessage(
        `${nextEntry.tokenNumber} has been called.`,
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "No waiting customer was found.",
        ),
      );
    } finally {
      setIsCallingNext(false);
    }
  }

  const waitingCount = queueEntries.filter(
    (entry) => entry.status === "Waiting",
  ).length;

  const calledCount = queueEntries.filter(
    (entry) => entry.status === "Called",
  ).length;

  const servingCount = queueEntries.filter(
    (entry) => entry.status === "Serving",
  ).length;

  const completedCount = queueEntries.filter(
    (entry) => entry.status === "Completed",
  ).length;

  return (
    <main className="module-page">
      <PageHeader
        eyebrow={currentBusiness?.name}
        title="Live Queue"
        description="Manage walk-ins, call customers and track service progress in real time."
        actions={
          <>
            <Button
              icon={<RefreshCw size={17} />}
              isLoading={isLoading}
              onClick={() => void loadQueue()}
              variant="secondary"
            >
              Refresh
            </Button>

            <Button
              icon={<Plus size={18} />}
              onClick={() => setIsFormOpen(true)}
            >
              Add walk-in
            </Button>
          </>
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

      <section className="stat-grid">
        <StatCard title="Waiting" value={waitingCount} tone="warning" />
        <StatCard title="Called" value={calledCount} tone="info" />
        <StatCard title="Serving" value={servingCount} />
        <StatCard title="Completed" value={completedCount} tone="success" />
      </section>

      <section className="filter-bar">
        <SearchInput
          value={searchText}
          onChange={(event) =>
            setSearchText(event.target.value)
          }
          placeholder="Search token or customer"
        />

        <Select
          label="Status"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="Active">Active queue</option>
          <option value="All">All statuses</option>
          <option value="Waiting">Waiting</option>
          <option value="Called">Called</option>
          <option value="Serving">Serving</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="NoShow">No show</option>
        </Select>

        <Select
          label="Service"
          value={serviceFilter}
          onChange={(event) =>
            setServiceFilter(event.target.value)
          }
        >
          <option value="">All services</option>

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
        </Select>

        <Button
          disabled={waitingCount === 0}
          icon={<UserCheck size={18} />}
          isLoading={isCallingNext}
          onClick={() => void handleCallNext()}
        >
          Call next
        </Button>
      </section>

      {isLoading ? (
        <LoadingState label="Loading live queue..." />
      ) : filteredEntries.length === 0 ? (
        <EmptyState
          icon={<ListOrdered size={32} />}
          title="No queue entries found"
          description="Add a walk-in customer or adjust the filters."
        />
      ) : (
        <section className="card-grid">
          {filteredEntries.map((entry) => (
            <QueueCard
              key={entry.id}
              entry={entry}
              isUpdating={
                updatingEntryId === entry.id
              }
              onStatusChange={handleStatusChange}
            />
          ))}
        </section>
      )}

      {isFormOpen && (
        <Modal
          title="Add walk-in customer"
          description="Create a queue token for a walk-in customer."
          onClose={() => setIsFormOpen(false)}
        >
          <JoinQueueForm
            services={services}
            staffMembers={staffMembers}
            isSubmitting={isSubmitting}
            onSubmit={handleJoinQueue}
            onCancel={() => setIsFormOpen(false)}
          />
        </Modal>
      )}
    </main>
  );
}
