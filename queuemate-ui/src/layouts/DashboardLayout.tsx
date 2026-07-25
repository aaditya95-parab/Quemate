import {
  LayoutDashboard,
  ListOrdered,
  CalendarDays,
  BriefcaseBusiness,
  Users,
  LogOut,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import BusinessSelector from "../components/BusinessSelector";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { Clock3 } from "lucide-react";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const {
    currentBusiness,
    clearBusinessSelection,
  } = useBusiness();

  const navigate = useNavigate();

  function handleLogout() {
    clearBusinessSelection();
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <div>
      <aside>
        <header>
          <h2>QueueMate</h2>

          <p>
            Smart queue management
          </p>
        </header>

        <BusinessSelector />

        <nav>
          <NavLink to="/dashboard" end>
            <LayoutDashboard size={18} />
            Overview
          </NavLink>

          <NavLink to="/dashboard/live-queue">
            <ListOrdered size={18} />
            Live Queue
          </NavLink>

          <NavLink to="/dashboard/appointments">
            <CalendarDays size={18} />
            Appointments
          </NavLink>

          <NavLink to="/dashboard/services">
            <BriefcaseBusiness size={18} />
            Services
          </NavLink>

          <NavLink to="/dashboard/staff">
            <Users size={18} />
            Staff
          </NavLink>

          <NavLink to="/dashboard/working-hours">
  <Clock3 size={18} />
  Working Hours
</NavLink>

        </nav>

        <footer>
          <p>{user?.fullName}</p>
          <p>{currentBusiness?.currentUserRole}</p>

          <button
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </footer>
      </aside>

      <div>
        <header>
          <div>
            <h1>{currentBusiness?.name}</h1>
            <p>{currentBusiness?.category}</p>
          </div>

          <span>{user?.email}</span>
        </header>

        <Outlet />
      </div>
    </div>
  );
}