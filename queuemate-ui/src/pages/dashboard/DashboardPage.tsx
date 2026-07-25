import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <main>
      <h1>Welcome, {user?.fullName}</h1>
      <p>Your QueueMate dashboard is ready.</p>
    </main>
  );
}