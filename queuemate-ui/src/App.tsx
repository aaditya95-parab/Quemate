import {
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import BusinessOnboardingPage from "./pages/onboarding/BusinessOnboardingPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import LiveQueuePage from "./pages/dashboard/LiveQueuePage";
import ProtectedRoute from "./routes/ProtectedRoute";
import BusinessRequiredRoute from "./routes/BusinessRequiredRoute";
import ServicesPage from "./pages/dashboard/ServicesPage";
import StaffPage from "./pages/dashboard/StaffPage";
import WorkingHoursPage from "./pages/dashboard/WorkingHoursPage";
import AppointmentsPage from "./pages/dashboard/AppointmentsPage";
import BookAppointmentPage from "./pages/public/BookAppointmentPage";

function PublicBookingRoute() {
  const { businessId } = useParams();

  if (!businessId) {
    return <Navigate to="/" replace />;
  }

  return (
    <BookAppointmentPage
      businessId={businessId}
    />
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
  element={<AppointmentsPage />}
/>
            

            <Route
  path="services"
  element={<ServicesPage />}
/>

            <Route
  path="staff"
  element={<StaffPage />}
/>          
<Route
  path="working-hours"
  element={<WorkingHoursPage />}
/>

          </Route>
        </Route>
      </Route>

      <Route
        path="/book/:businessId"
        element={<PublicBookingRoute />}
      />

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
