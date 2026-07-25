import {
  useCallback,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import {
  Building2,
  CalendarOff,
  Clock3,
  RefreshCw,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { getStaff } from "../../api/staffApi";
import {
  createStaffTimeOff,
  deleteStaffTimeOff,
  getBusinessWorkingHours,
  getStaffTimeOff,
  getStaffWorkingHours,
  updateBusinessWorkingHours,
  updateStaffWorkingHours,
} from "../../api/workingHoursApi";
import TimeOffForm from "../../components/working-hours/TimeOffForm";
import WeeklyHoursEditor from "../../components/working-hours/WeeklyHoursEditor";
import { useBusiness } from "../../context/BusinessContext";
import type { StaffMember } from "../../types/staff";
import type {
  CreateStaffTimeOffRequest,
  StaffTimeOff,
  WorkingHour,
  WorkingHourRequest,
} from "../../types/workingHours";

type Tab = "business" | "staff" | "time-off";

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function WorkingHoursPage() {
  const {
    currentBusiness,
    currentBusinessId,
  } = useBusiness();

  const businessId = currentBusinessId ?? "";

  const [activeTab, setActiveTab] =
    useState<Tab>("business");

  const [businessHours, setBusinessHours] =
    useState<WorkingHour[]>([]);

  const [staffHours, setStaffHours] =
    useState<WorkingHour[]>([]);

  const [staffMembers, setStaffMembers] =
    useState<StaffMember[]>([]);

  const [selectedStaffId, setSelectedStaffId] =
    useState("");

  const [timeOffEntries, setTimeOffEntries] =
    useState<StaffTimeOff[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isAddingTimeOff, setIsAddingTimeOff] =
    useState(false);

  const [deletingTimeOffId, setDeletingTimeOffId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const loadInitialData = useCallback(async () => {
    if (!businessId) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [hoursResult, staffResult] =
        await Promise.all([
          getBusinessWorkingHours(businessId),
          getStaff(businessId),
        ]);

      setBusinessHours(hoursResult);

      const activeStaff = staffResult.filter(
        (staff) => staff.isActive,
      );

      setStaffMembers(activeStaff);

      setSelectedStaffId((currentId) => {
        const currentStillExists = activeStaff.some(
          (staff) => staff.id === currentId,
        );

        if (currentStillExists) {
          return currentId;
        }

        return activeStaff[0]?.id ?? "";
      });
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not load working hours.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const loadSelectedStaffData =
    useCallback(async () => {
      if (!businessId || !selectedStaffId) {
        setStaffHours([]);
        setTimeOffEntries([]);
        return;
      }

      setError("");

      try {
        const [hoursResult, timeOffResult] =
          await Promise.all([
            getStaffWorkingHours(
              businessId,
              selectedStaffId,
            ),
            getStaffTimeOff(
              businessId,
              selectedStaffId,
            ),
          ]);

        setStaffHours(hoursResult);
        setTimeOffEntries(timeOffResult);
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Could not load the staff schedule.",
          ),
        );
      }
    }, [businessId, selectedStaffId]);

  useEffect(() => {
    void loadSelectedStaffData();
  }, [loadSelectedStaffData]);

  async function handleSaveBusinessHours(
    hours: WorkingHourRequest[],
  ) {
    if (!businessId) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const updatedHours =
        await updateBusinessWorkingHours(
          businessId,
          { workingHours: hours },
        );

      setBusinessHours(updatedHours);

      setSuccessMessage(
        "Business hours updated successfully.",
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not update business hours.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveStaffHours(
    hours: WorkingHourRequest[],
  ) {
    if (!businessId || !selectedStaffId) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const updatedHours =
        await updateStaffWorkingHours(
          businessId,
          selectedStaffId,
          { workingHours: hours },
        );

      setStaffHours(updatedHours);

      setSuccessMessage(
        "Staff schedule updated successfully.",
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not update staff hours.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateTimeOff(
    request: CreateStaffTimeOffRequest,
  ) {
    if (!businessId || !selectedStaffId) {
      return;
    }

    setIsAddingTimeOff(true);
    setError("");
    setSuccessMessage("");

    try {
      const createdEntry = await createStaffTimeOff(
        businessId,
        selectedStaffId,
        request,
      );

      setTimeOffEntries((currentEntries) =>
        [...currentEntries, createdEntry].sort(
          (first, second) =>
            new Date(
              first.startDateTimeUtc,
            ).getTime() -
            new Date(
              second.startDateTimeUtc,
            ).getTime(),
        ),
      );

      setSuccessMessage(
        "Time-off entry created successfully.",
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not create time-off entry.",
        ),
      );
    } finally {
      setIsAddingTimeOff(false);
    }
  }

  async function handleDeleteTimeOff(
    timeOffId: string,
  ) {
    if (!businessId || !selectedStaffId) {
      return;
    }

    setDeletingTimeOffId(timeOffId);
    setError("");
    setSuccessMessage("");

    try {
      await deleteStaffTimeOff(
        businessId,
        selectedStaffId,
        timeOffId,
      );

      setTimeOffEntries((currentEntries) =>
        currentEntries.filter(
          (entry) => entry.id !== timeOffId,
        ),
      );

      setSuccessMessage(
        "Time-off entry removed successfully.",
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not remove time-off entry.",
        ),
      );
    } finally {
      setDeletingTimeOffId(null);
    }
  }

  const selectedStaff = staffMembers.find(
    (staff) => staff.id === selectedStaffId,
  );

  if (isLoading) {
    return (
      <main>
        <p>Loading working hours...</p>
      </main>
    );
  }

  return (
    <main>
      <header>
        <div>
          <p>{currentBusiness?.name}</p>
          <h1>Working Hours</h1>
          <p>
            Configure business hours, staff schedules,
            and leave periods.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadInitialData()}
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

      <nav aria-label="Working hours sections">
        <button
          type="button"
          onClick={() => setActiveTab("business")}
          aria-pressed={activeTab === "business"}
        >
          <Building2 size={18} />
          Business hours
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("staff")}
          aria-pressed={activeTab === "staff"}
        >
          <UserRound size={18} />
          Staff schedule
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("time-off")}
          aria-pressed={activeTab === "time-off"}
        >
          <CalendarOff size={18} />
          Time off
        </button>
      </nav>

      {activeTab === "business" && (
        <section>
          <header>
            <Clock3 size={22} />

            <div>
              <h2>Business operating hours</h2>
              <p>
                These hours control when appointments
                and queue services are available.
              </p>
            </div>
          </header>

          <WeeklyHoursEditor
            hours={businessHours}
            isSaving={isSaving}
            onSave={handleSaveBusinessHours}
          />
        </section>
      )}

      {activeTab !== "business" && (
        <section>
          <label>
            Select staff member

            <select
              value={selectedStaffId}
              onChange={(event) =>
                setSelectedStaffId(
                  event.target.value,
                )
              }
            >
              {staffMembers.length === 0 && (
                <option value="">
                  No active staff available
                </option>
              )}

              {staffMembers.map((staff) => (
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
          </label>
        </section>
      )}

      {activeTab === "staff" && (
        <section>
          <header>
            <UserRound size={22} />

            <div>
              <h2>
                {selectedStaff
                  ? `${selectedStaff.fullName}'s schedule`
                  : "Staff schedule"}
              </h2>

              <p>
                Staff hours must remain within the
                configured business hours.
              </p>
            </div>
          </header>

          {selectedStaffId ? (
            <WeeklyHoursEditor
              hours={staffHours}
              isSaving={isSaving}
              onSave={handleSaveStaffHours}
            />
          ) : (
            <p>
              Add an active staff member before configuring
              staff hours.
            </p>
          )}
        </section>
      )}

      {activeTab === "time-off" && (
        <section>
          <header>
            <CalendarOff size={22} />

            <div>
              <h2>Staff time off</h2>

              <p>
                Block leave, holidays, or temporary
                unavailability.
              </p>
            </div>
          </header>

          {selectedStaffId ? (
            <>
              <TimeOffForm
                isSubmitting={isAddingTimeOff}
                onSubmit={handleCreateTimeOff}
              />

              <section>
                <h3>Scheduled time off</h3>

                {timeOffEntries.length === 0 ? (
                  <p>
                    No time-off periods have been added.
                  </p>
                ) : (
                  <div>
                    {timeOffEntries.map((entry) => (
                      <article key={entry.id}>
                        <div>
                          <strong>
                            {formatDateTime(
                              entry.startDateTimeUtc,
                            )}
                          </strong>

                          <span>to</span>

                          <strong>
                            {formatDateTime(
                              entry.endDateTimeUtc,
                            )}
                          </strong>
                        </div>

                        <p>
                          {entry.reason ||
                            "No reason provided"}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            void handleDeleteTimeOff(
                              entry.id,
                            )
                          }
                          disabled={
                            deletingTimeOffId ===
                            entry.id
                          }
                        >
                          <Trash2 size={17} />

                          {deletingTimeOffId ===
                          entry.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <p>
              Add an active staff member before creating
              time-off entries.
            </p>
          )}
        </section>
      )}
    </main>
  );
}