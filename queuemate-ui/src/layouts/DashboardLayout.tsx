import {
  LayoutDashboard,
  ListOrdered,
  CalendarDays,
  BriefcaseBusiness,
  Users,
  LogOut,
  Bell,
  CalendarClock,
  Menu,
  X,
  ExternalLink,
  Clock3,
} from "lucide-react";
import { useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import BusinessSelector from "../components/BusinessSelector";
import Button from "../components/ui/Button";
import Tooltip from "../components/ui/Tooltip";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { formatShortDate, getInitials } from "../utils/format";

const navItems = [
  {
    to: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/dashboard/live-queue",
    label: "Live Queue",
    icon: ListOrdered,
    end: false,
  },
  {
    to: "/dashboard/appointments",
    label: "Appointments",
    icon: CalendarDays,
    end: false,
  },
  {
    to: "/dashboard/services",
    label: "Services",
    icon: BriefcaseBusiness,
    end: false,
  },
  {
    to: "/dashboard/staff",
    label: "Staff",
    icon: Users,
    end: false,
  },
  {
    to: "/dashboard/working-hours",
    label: "Working Hours",
    icon: Clock3,
    end: false,
  },
] as const;

function getPageTitle(pathname: string): string {
  const match = navItems
    .filter((item) => item.to !== "/dashboard")
    .find((item) => pathname.startsWith(item.to));

  return match?.label ?? "Overview";
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const {
    currentBusiness,
    clearBusinessSelection,
  } = useBusiness();

  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  function handleLogout() {
    clearBusinessSelection();
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${isSidebarOpen ? "is-open" : ""}`}
        aria-label="Dashboard navigation"
      >
        <header className="brand">
          <span className="brand-mark">Q</span>

          <div>
            <h2>QueueMate</h2>
            <p>Smart queue OS</p>
          </div>

          <Button
            aria-label="Close navigation"
            className="mobile-menu-button"
            icon={<X size={18} />}
            onClick={() => setIsSidebarOpen(false)}
            variant="ghost"
          />
        </header>

        <BusinessSelector />

        <nav className="sidebar-nav">
          <p className="sidebar-section-title">Workspace</p>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                end={item.end}
                key={item.to}
                onClick={() => setIsSidebarOpen(false)}
                to={item.to}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <footer className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">
              {getInitials(user?.fullName)}
            </span>

            <div>
              <strong>{user?.fullName}</strong>
              <span>{currentBusiness?.currentUserRole}</span>
            </div>
          </div>

          <Button
            icon={<LogOut size={18} />}
            onClick={handleLogout}
            variant="secondary"
          >
            Logout
          </Button>
        </footer>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <Button
              aria-label="Open navigation"
              className="mobile-menu-button"
              icon={<Menu size={18} />}
              onClick={() => setIsSidebarOpen(true)}
              variant="secondary"
            />
            <p className="eyebrow">
              {formatShortDate()}
            </p>
            <h1>{getPageTitle(location.pathname)}</h1>
            <p>
              {currentBusiness?.name}
              {currentBusiness?.category
                ? ` · ${currentBusiness.category}`
                : ""}
            </p>
          </div>

          <div className="topbar__actions">
            {currentBusiness && (
              <Button
                icon={<ExternalLink size={17} />}
                onClick={() => {
                  window.open(
                    `/book/${currentBusiness.id}`,
                    "_blank",
                    "noreferrer",
                  );
                }}
                variant="secondary"
              >
                Booking page
              </Button>
            )}

            <Tooltip label="Notifications">
              <Button
                aria-label="Notifications"
                icon={<Bell size={17} />}
                variant="ghost"
              />
            </Tooltip>

            <div className="user-chip">
              <span className="avatar">
                {getInitials(user?.fullName)}
              </span>
              <div>
                <strong>{user?.email}</strong>
                <span>
                  <CalendarClock size={13} /> Live workspace
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-shell">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
