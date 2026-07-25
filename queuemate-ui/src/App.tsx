import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import BusinessOnboardingPage from "./pages/onboarding/BusinessOnboardingPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import LiveQueuePage from "./pages/dashboard/LiveQueuePage";
import ProtectedRoute from "./routes/ProtectedRoute";
import BusinessRequiredRoute from "./routes/BusinessRequiredRoute";

function PlaceholderPage({
  title,
}: {
  title: string;
}) {
  return (
    <main>
      <h1>{title}</h1>
      <p>This module will be connected next.</p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/onboarding"
          element={<BusinessOnboardingPage />}
        />

        <Route element={<BusinessRequiredRoute />}>
          <Route
            path="/dashboard"
            element={<DashboardLayout />}
          >
            <Route
              index
              element={<DashboardPage />}
            />

            <Route
              path="live-queue"
              element={<LiveQueuePage />}
            />

            <Route
              path="appointments"
              element={
                <PlaceholderPage
                  title="Appointments"
                />
              }
            />

            <Route
              path="services"
              element={
                <PlaceholderPage
                  title="Services"
                />
              }
            />

            <Route
              path="staff"
              element={
                <PlaceholderPage
                  title="Staff"
                />
              }
            />
          </Route>
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}