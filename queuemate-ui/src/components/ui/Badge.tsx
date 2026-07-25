import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type BadgeTone =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export default function Badge({
  className,
  tone = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn("ui-badge", `ui-badge--${tone}`, className)}
      {...props}
    />
  );
}
