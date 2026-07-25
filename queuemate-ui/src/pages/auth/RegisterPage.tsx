import { useState, type FormEvent } from "react";
import axios from "axios";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
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
    <main>
      <section>
        <h1>Create your QueueMate account</h1>

        <form onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength={8}
              required
            />
          </label>

          {error && <p role="alert">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p>
          Already registered?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}