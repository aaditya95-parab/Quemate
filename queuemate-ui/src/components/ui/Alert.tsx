import { X } from "lucide-react";
import Button from "./Button";

interface AlertProps {
  tone?: "success" | "danger" | "warning" | "info";
  children: string;
  onDismiss?: () => void;
}

export default function Alert({
  tone = "info",
  children,
  onDismiss,
}: AlertProps) {
  return (
    <div className={`ui-alert ui-alert--${tone}`} role={tone === "danger" ? "alert" : "status"}>
      <span>{children}</span>
      {onDismiss && (
        <Button
          aria-label="Dismiss message"
          icon={<X size={16} />}
          onClick={onDismiss}
          variant="ghost"
        />
      )}
    </div>
  );
}
