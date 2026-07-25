import Badge from "./Badge";

const statusTone: Record<string, "default" | "primary" | "success" | "warning" | "danger" | "info" | "muted"> = {
  Waiting: "warning",
  Called: "info",
  Serving: "primary",
  Completed: "success",
  Cancelled: "danger",
  NoShow: "danger",
  "No Show": "danger",
  Booked: "info",
  Confirmed: "primary",
  CheckedIn: "info",
  "Checked In": "info",
  InService: "primary",
  "In Service": "primary",
  Active: "success",
  Inactive: "muted",
};

function normalizeStatus(status: string): string {
  return status
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace("No Show", "No show")
    .replace("Checked In", "Checked in");
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={statusTone[status] ?? "default"}>
      {normalizeStatus(status)}
    </Badge>
  );
}
