import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  BriefcaseBusiness,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  createService,
  deactivateService,
  getServices,
  updateService,
} from "../../api/serviceApi";
import ServiceCard from "../../components/services/ServiceCard";
import ServiceForm from "../../components/services/ServiceForm";
import { useBusiness } from "../../context/BusinessContext";
import type {
  CreateServiceRequest,
  Service,
  UpdateServiceRequest,
} from "../../types/service";

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      fallback
    );
  }

  return fallback;
}

export default function ServicesPage() {
  const {
    currentBusiness,
    currentBusinessId,
  } = useBusiness();

  const [services, setServices] = useState<Service[]>([]);
  const [searchText, setSearchText] = useState("");
  const [showInactive, setShowInactive] =
    useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [updatingServiceId, setUpdatingServiceId] =
    useState<string | null>(null);

  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const businessId = currentBusinessId ?? "";

  const loadServices = useCallback(async () => {
    if (!businessId) {
      setServices([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getServices(businessId);
      setServices(result);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not load services.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const filteredServices = useMemo(() => {
    const normalizedSearch =
      searchText.trim().toLowerCase();

    return services.filter((service) => {
      const matchesStatus =
        showInactive || service.isActive;

      const matchesSearch =
        !normalizedSearch ||
        service.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        service.description
          ?.toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [services, searchText, showInactive]);

  function openCreateForm() {
    setSelectedService(null);
    setError("");
    setSuccessMessage("");
    setIsFormOpen(true);
  }

  function openEditForm(service: Service) {
    setSelectedService(service);
    setError("");
    setSuccessMessage("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setSelectedService(null);
    setIsFormOpen(false);
  }

  async function handleSave(
    request:
      | CreateServiceRequest
      | UpdateServiceRequest,
  ) {
    if (!businessId) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      if (selectedService) {
        const updatedService = await updateService(
          businessId,
          selectedService.id,
          request as UpdateServiceRequest,
        );

        setServices((currentServices) =>
          currentServices.map((service) =>
            service.id === updatedService.id
              ? updatedService
              : service,
          ),
        );

        setSuccessMessage(
          "Service updated successfully.",
        );
      } else {
        const createdService = await createService(
          businessId,
          request as CreateServiceRequest,
        );

        setServices((currentServices) =>
          [...currentServices, createdService].sort(
            (first, second) =>
              first.name.localeCompare(second.name),
          ),
        );

        setSuccessMessage(
          "Service created successfully.",
        );
      }

      closeForm();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          selectedService
            ? "Could not update service."
            : "Could not create service.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(
    service: Service,
  ) {
    if (!businessId) {
      return;
    }

    setUpdatingServiceId(service.id);
    setError("");
    setSuccessMessage("");

    try {
      if (service.isActive) {
        await deactivateService(
          businessId,
          service.id,
        );

        setServices((currentServices) =>
          currentServices.map((currentService) =>
            currentService.id === service.id
              ? {
                  ...currentService,
                  isActive: false,
                  updatedAtUtc:
                    new Date().toISOString(),
                }
              : currentService,
          ),
        );

        setSuccessMessage(
          "Service deactivated successfully.",
        );
      } else {
        const updatedService = await updateService(
          businessId,
          service.id,
          {
            name: service.name,
            description:
              service.description ?? undefined,
            durationMinutes:
              service.durationMinutes,
            price: service.price,
            isActive: true,
          },
        );

        setServices((currentServices) =>
          currentServices.map((currentService) =>
            currentService.id === updatedService.id
              ? updatedService
              : currentService,
          ),
        );

        setSuccessMessage(
          "Service reactivated successfully.",
        );
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not update service status.",
        ),
      );
    } finally {
      setUpdatingServiceId(null);
    }
  }

  return (
    <main>
      <header>
        <div>
          <p>
            {currentBusiness?.name}
          </p>

          <h1>Services</h1>

          <p>
            Manage the services customers can book
            or select when joining the queue.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Add service
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
            placeholder="Search services"
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

          Show inactive services
        </label>

        <button
          type="button"
          onClick={() => void loadServices()}
          disabled={isLoading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </section>

      <section>
        <div>
          <span>
            Total services
            <strong>{services.length}</strong>
          </span>

          <span>
            Active
            <strong>
              {
                services.filter(
                  (service) => service.isActive,
                ).length
              }
            </strong>
          </span>

          <span>
            Inactive
            <strong>
              {
                services.filter(
                  (service) => !service.isActive,
                ).length
              }
            </strong>
          </span>
        </div>
      </section>

      {isLoading ? (
        <section>
          <p>Loading services...</p>
        </section>
      ) : filteredServices.length === 0 ? (
        <section>
          <BriefcaseBusiness size={36} />

          <h2>
            {services.length === 0
              ? "No services added"
              : "No matching services"}
          </h2>

          <p>
            {services.length === 0
              ? "Create your first service so customers can begin booking appointments."
              : "Try changing your search or filter."}
          </p>

          {services.length === 0 && (
            <button
              type="button"
              onClick={openCreateForm}
            >
              <Plus size={18} />
              Add first service
            </button>
          )}
        </section>
      ) : (
        <section>
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isUpdating={
                updatingServiceId === service.id
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
              selectedService
                ? "Edit service"
                : "Create service"
            }
          >
            <ServiceForm
              service={selectedService}
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