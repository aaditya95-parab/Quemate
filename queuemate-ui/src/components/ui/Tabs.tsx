import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface TabItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

export default function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
}: TabsProps<T>) {
  return (
    <nav aria-label={label} className="tabs">
      {items.map((item) => (
        <button
          className={cn("tabs__item", item.value === value && "is-active")}
          key={item.value}
          onClick={() => onChange(item.value)}
          type="button"
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}
