import type { ReactNode } from "react";

export default function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="tooltip" data-tooltip={label}>
      {children}
    </span>
  );
}
