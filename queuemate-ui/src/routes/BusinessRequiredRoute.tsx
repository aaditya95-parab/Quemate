import {
  Navigate,
  Outlet,
} from "react-router-dom";
import { useBusiness } from "../context/BusinessContext";

export default function BusinessRequiredRoute() {
  const {
    businesses,
    currentBusiness,
    isLoadingBusinesses,
  } = useBusiness();

  if (isLoadingBusinesses) {
    return (
      <main>
        <p>Loading your business...</p>
      </main>
    );
  }

  if (businesses.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!currentBusiness) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}