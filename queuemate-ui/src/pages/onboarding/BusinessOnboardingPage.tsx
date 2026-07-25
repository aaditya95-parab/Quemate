import {
  useState,
  type FormEvent,
} from "react";
import axios from "axios";
import { Building2, CheckCircle2 } from "lucide-react";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingState from "../../components/ui/LoadingState";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
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
      <main className="auth-card-wrap">
        <LoadingState label="Loading your workspace..." />
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
    <main className="auth-card-wrap">
      <section className="auth-card auth-card--wide">
        <header className="stack">
          <p className="eyebrow">Step 1 of 1 - Business setup</p>
          <h1>Create your business</h1>
          <p>
            Add your business details to start managing
            appointments and queues.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input
              label="Business name"
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

            <Select
              label="Business category"
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
            </Select>

            <Input
              label="Phone"
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

            <Input
              label="Business email"
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

            <Textarea
              className="full-span"
              label="Address"
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

            <Select
              className="full-span"
              label="Time zone"
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
            </Select>
          </div>

          {error && (
            <Alert tone="danger" onDismiss={() => setError("")}>
              {error}
            </Alert>
          )}

          <div className="form-actions">
          <Button
            icon={isSubmitting ? undefined : <Building2 size={18} />}
            isLoading={isSubmitting}
            type="submit"
          >
            Create business
          </Button>
          </div>
        </form>

        <div className="ui-alert ui-alert--success">
          <CheckCircle2 size={18} />
          <span>
            You can edit services, staff, working hours, and booking
            preferences after setup.
          </span>
        </div>
      </section>
    </main>
  );
}
