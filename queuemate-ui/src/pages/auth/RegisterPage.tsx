import { useState, type FormEvent } from "react";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Sparkles,
  UserPlus,
} from "lucide-react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const {
    register,
    isAuthenticated,
  } = useAuth();

  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  if (isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await register({
        fullName,
        email,
        password,
      });

      navigate("/onboarding", {
        replace: true,
      });
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Registration failed.",
        );
      } else {
        setError("Registration failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="stack">
          <div className="brand">
            <span className="brand-mark">Q</span>
            <div>
              <h2>QueueMate</h2>
              <p>Appointment operations for modern teams</p>
            </div>
          </div>

          <div className="stack">
            <p className="eyebrow">Start in minutes</p>
            <h1>Create a polished booking experience for your business.</h1>
            <p>
              Configure services, invite staff, publish a booking page,
              and handle walk-ins with a live queue.
            </p>
          </div>

          <p className="entity-row">
            <Sparkles size={18} /> Built for salons, clinics, service
            centres, and consultancies.
          </p>
        </div>
      </section>

      <section className="auth-card-wrap">
        <div className="auth-card">
          <header className="stack">
            <p className="eyebrow">Create account</p>
            <h1>Join QueueMate</h1>
            <p>Your workspace setup starts after registration.</p>
          </header>

        <form onSubmit={handleSubmit}>
          <div className="stack">
            <Input
              autoComplete="name"
              label="Full name"
              onChange={(event) =>
                setFullName(event.target.value)
              }
              required
              value={fullName}
            />

            <Input
              autoComplete="email"
              label="Email"
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              type="email"
              value={email}
            />

            <div className="form-field">
              <span>Password</span>
              <div className="entity-row">
                <input
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  minLength={8}
                  required
                />
                <Button
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  icon={
                    showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )
                  }
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  variant="secondary"
                />
              </div>
              <small>Use at least 8 characters.</small>
            </div>

            {error && (
              <Alert tone="danger" onDismiss={() => setError("")}>
                {error}
              </Alert>
            )}

          <Button
            icon={<UserPlus size={18} />}
            isLoading={isSubmitting}
            type="submit"
          >
            Create account
          </Button>
          </div>
        </form>

        <p>
          Already registered?{" "}
          <Link to="/login">Sign in</Link>
        </p>
        </div>
      </section>
    </main>
  );
}
