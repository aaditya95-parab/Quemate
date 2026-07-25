import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface StatCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
}

export default function StatCard({
  title,
  value,
  description,
  icon,
  tone = "primary",
}: StatCardProps) {
  return (
    <article className="stat-card">
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        {description && <span>{description}</span>}
      </div>
      {icon && <div className={cn("stat-card__icon", `tone-${tone}`)}>{icon}</div>}
    </article>
  );
}
