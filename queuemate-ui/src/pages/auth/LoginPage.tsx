import { useState, type FormEvent } from "react";
import axios from "axios";
import {
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const {
    login,
    isAuthenticated,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
      });

      const destination =
        typeof location.state === "object" &&
        location.state !== null &&
        "from" in location.state
          ? String(location.state.from)
          : "/dashboard";

      navigate(destination, {
        replace: true,
      });
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Login failed.",
        );
      } else {
        setError("Login failed.");
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
              <p>Smart booking and queue management</p>
            </div>
          </div>

          <div className="stack">
            <p className="eyebrow">Operations, simplified</p>
            <h1>Run appointments and walk-ins from one calm workspace.</h1>
            <p>
              QueueMate keeps bookings, staff schedules, and live queue
              movement visible without making your front desk feel busy.
            </p>
          </div>

          <div className="stack">
            <p className="entity-row">
              <ShieldCheck size={18} /> Secure staff access
            </p>
            <p className="entity-row">
              <TimerReset size={18} /> Real-time queue updates
            </p>
            <p className="entity-row">
              <Sparkles size={18} /> Polished customer booking flow
            </p>
          </div>
        </div>
      </section>

      <section className="auth-card-wrap">
        <div className="auth-card">
          <header className="stack">
            <p className="eyebrow">Welcome back</p>
            <h1>Sign in</h1>
            <p>Manage bookings, staff, services, and the live queue.</p>
          </header>

        <form onSubmit={handleSubmit}>
          <div className="stack">
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
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
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
            </div>

            {error && (
              <Alert tone="danger" onDismiss={() => setError("")}>
                {error}
              </Alert>
            )}

          <Button
            icon={<LogIn size={18} />}
            isLoading={isSubmitting}
            type="submit"
            variant="primary"
          >
            Sign in
          </Button>
          </div>
        </form>

        <p>
          New to QueueMate?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>
        </div>
      </section>
    </main>
  );
}
