import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import {
  assignStaffServices,
  createStaff,
  deactivateStaff,
  getStaff,
  updateStaff,
} from "../../api/staffApi";
import { getServices } from "../../api/serviceApi";
import StaffCard from "../../components/staff/StaffCard";
import StaffForm from "../../components/staff/StaffForm";
import { useBusiness } from "../../context/BusinessContext";
import type { Service } from "../../types/service";
import type {
  CreateStaffRequest,
  StaffMember,
  UpdateStaffRequest,
} from "../../types/staff";

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}

export default function StaffPage() {
  const {
    currentBusiness,
    currentBusinessId,
  } = useBusiness();

  const [staffMembers, setStaffMembers] =
    useState<StaffMember[]>([]);

  const [services, setServices] = useState<Service[]>([]);

  const [searchText, setSearchText] = useState("");
  const [showInactive, setShowInactive] =
    useState(true);

  const [selectedStaff, setSelectedStaff] =
    useState<StaffMember | null>(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [updatingStaffId, setUpdatingStaffId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const businessId = currentBusinessId ?? "";

  const loadData = useCallback(async () => {
    if (!businessId) {
      setStaffMembers([]);
      setServices([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [staffResult, serviceResult] =
        await Promise.all([
          getStaff(businessId),
          getServices(businessId),
        ]);

      setStaffMembers(staffResult);
      setServices(serviceResult);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not load staff information.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredStaff = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return staffMembers.filter((staff) => {
      const matchesStatus =
        showInactive || staff.isActive;

      const matchesSearch =
        !search ||
        staff.fullName.toLowerCase().includes(search) ||
        staff.email?.toLowerCase().includes(search) ||
        staff.phone?.toLowerCase().includes(search) ||
        staff.jobTitle?.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [staffMembers, searchText, showInactive]);

  function openCreateForm() {
    setSelectedStaff(null);
    setError("");
    setSuccessMessage("");
    setIsFormOpen(true);
  }

  function openEditForm(staff: StaffMember) {
    setSelectedStaff(staff);
    setError("");
    setSuccessMessage("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setSelectedStaff(null);
    setIsFormOpen(false);
  }

  async function handleSave(
    request: CreateStaffRequest | UpdateStaffRequest,
    serviceIds: string[],
  ) {
    if (!businessId) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      if (selectedStaff) {
        await updateStaff(
          businessId,
          selectedStaff.id,
          request as UpdateStaffRequest,
        );

        const updatedStaff =
          await assignStaffServices(
            businessId,
            selectedStaff.id,
            { serviceIds },
          );

        setStaffMembers((currentStaff) =>
          currentStaff.map((staff) =>
            staff.id === updatedStaff.id
              ? updatedStaff
              : staff,
          ),
        );

        setSuccessMessage(
          "Staff member updated successfully.",
        );
      } else {
        const createdStaff = await createStaff(
          businessId,
          request as CreateStaffRequest,
        );

        setStaffMembers((currentStaff) =>
          [...currentStaff, createdStaff].sort(
            (first, second) =>
              first.fullName.localeCompare(
                second.fullName,
              ),
          ),
        );

        setSuccessMessage(
          "Staff member added successfully.",
        );
      }

      closeForm();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          selectedStaff
            ? "Could not update staff member."
            : "Could not create staff member.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(
    staff: StaffMember,
  ) {
    if (!businessId) {
      return;
    }

    setUpdatingStaffId(staff.id);
    setError("");
    setSuccessMessage("");

    try {
      if (staff.isActive) {
        await deactivateStaff(
          businessId,
          staff.id,
        );

        setStaffMembers((currentStaff) =>
          currentStaff.map((item) =>
            item.id === staff.id
              ? {
                  ...item,
                  isActive: false,
                  updatedAtUtc:
                    new Date().toISOString(),
                }
              : item,
          ),
        );

        setSuccessMessage(
          "Staff member deactivated successfully.",
        );
      } else {
        const updatedStaff = await updateStaff(
          businessId,
          staff.id,
          {
            fullName: staff.fullName,
            email: staff.email ?? undefined,
            phone: staff.phone ?? undefined,
            jobTitle: staff.jobTitle ?? undefined,
            isActive: true,
          },
        );

        setStaffMembers((currentStaff) =>
          currentStaff.map((item) =>
            item.id === updatedStaff.id
              ? updatedStaff
              : item,
          ),
        );

        setSuccessMessage(
          "Staff member reactivated successfully.",
        );
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not update staff status.",
        ),
      );
    } finally {
      setUpdatingStaffId(null);
    }
  }

  return (
    <main>
      <header>
        <div>
          <p>{currentBusiness?.name}</p>
          <h1>Staff</h1>
          <p>
            Manage staff members and assign the services
            they can provide.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Add staff
        </button>
      </header>

      {error && (
        <div role="alert">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
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
            aria-label="Dismiss message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section>
        <label>
          <Search size={18} />

          <input
            type="search"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Search staff"
          />
        </label>

        <label>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(event) =>
              setShowInactive(
                event.target.checked,
              )
            }
          />

          Show inactive staff
        </label>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={isLoading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </section>

      <section>
        <span>
          Total staff
          <strong>{staffMembers.length}</strong>
        </span>

        <span>
          Active
          <strong>
            {
              staffMembers.filter(
                (staff) => staff.isActive,
              ).length
            }
          </strong>
        </span>

        <span>
          Inactive
          <strong>
            {
              staffMembers.filter(
                (staff) => !staff.isActive,
              ).length
            }
          </strong>
        </span>
      </section>

      {isLoading ? (
        <section>
          <p>Loading staff...</p>
        </section>
      ) : filteredStaff.length === 0 ? (
        <section>
          <Users size={38} />

          <h2>
            {staffMembers.length === 0
              ? "No staff members added"
              : "No matching staff members"}
          </h2>

          <p>
            {staffMembers.length === 0
              ? "Add your first staff member and assign their services."
              : "Try changing your search or filter."}
          </p>

          {staffMembers.length === 0 && (
            <button
              type="button"
              onClick={openCreateForm}
            >
              <Plus size={18} />
              Add first staff member
            </button>
          )}
        </section>
      ) : (
        <section>
          {filteredStaff.map((staff) => (
            <StaffCard
              key={staff.id}
              staff={staff}
              isUpdating={
                updatingStaffId === staff.id
              }
              onEdit={openEditForm}
              onToggleStatus={
                handleToggleStatus
              }
            />
          ))}
        </section>
      )}

      {isFormOpen && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={
              selectedStaff
                ? "Edit staff member"
                : "Create staff member"
            }
          >
            <StaffForm
              staff={selectedStaff}
              services={services}
              isSubmitting={isSubmitting}
              onSubmit={handleSave}
              onCancel={closeForm}
            />
          </section>
        </div>
      )}
    </main>
  );
}