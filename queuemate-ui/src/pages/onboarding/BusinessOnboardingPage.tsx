import {
  useState,
  type FormEvent,
} from "react";
import axios from "axios";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useBusiness } from "../../context/BusinessContext";

interface FormState {
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  timeZone: string;
}

const initialFormState: FormState = {
  name: "",
  category: "",
  phone: "",
  email: "",
  address: "",
  timeZone: "Asia/Kolkata",
};

const businessCategories = [
  "Clinic",
  "Salon",
  "Repair Centre",
  "Consultancy",
  "Service Centre",
  "Restaurant",
  "Gym",
  "Government Office",
  "Other",
];

export default function BusinessOnboardingPage() {
  const {
    businesses,
    createBusiness,
    isLoadingBusinesses,
  } = useBusiness();

  const navigate = useNavigate();

  const [form, setForm] =
    useState<FormState>(initialFormState);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  if (isLoadingBusinesses) {
    return (
      <main>
        <p>Loading your workspace...</p>
      </main>
    );
  }

  if (businesses.length > 0) {
    return <Navigate to="/dashboard" replace />;
  }

  function updateField(
    field: keyof FormState,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await createBusiness({
        name: form.name.trim(),
        category: form.category,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        timeZone: form.timeZone,
      });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Could not create your business.",
        );
      } else {
        setError("Could not create your business.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <section>
        <header>
          <p>QueueMate setup</p>
          <h1>Create your business</h1>
          <p>
            Add your business details to start managing
            appointments and queues.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <label>
            Business name
            <input
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value,
                )
              }
              placeholder="Style Zone Salon"
              maxLength={150}
              required
            />
          </label>

          <label>
            Business category
            <select
              value={form.category}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value,
                )
              }
              required
            >
              <option value="">
                Select a category
              </option>

              {businessCategories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Phone
            <input
              type="tel"
              value={form.phone}
              onChange={(event) =>
                updateField(
                  "phone",
                  event.target.value,
                )
              }
              placeholder="9876543210"
            />
          </label>

          <label>
            Business email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value,
                )
              }
              placeholder="contact@business.com"
            />
          </label>

          <label>
            Address
            <textarea
              value={form.address}
              onChange={(event) =>
                updateField(
                  "address",
                  event.target.value,
                )
              }
              placeholder="Mumbai, Maharashtra"
              rows={3}
            />
          </label>

          <label>
            Time zone
            <select
              value={form.timeZone}
              onChange={(event) =>
                updateField(
                  "timeZone",
                  event.target.value,
                )
              }
            >
              <option value="Asia/Kolkata">
                India Standard Time
              </option>

              <option value="UTC">
                Coordinated Universal Time
              </option>
            </select>
          </label>

          {error && (
            <p role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Creating business..."
              : "Create business"}
          </button>
        </form>
      </section>
    </main>
  );
}