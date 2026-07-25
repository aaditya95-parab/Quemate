import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export default function Card({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return <article className={cn("ui-card", className)} {...props} />;
}
