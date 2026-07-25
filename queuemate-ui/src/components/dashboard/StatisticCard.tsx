import type {
  LucideIcon,
} from "lucide-react";
import StatCard from "../ui/StatCard";

interface StatisticCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}

export default function StatisticCard({
  title,
  value,
  description,
  icon: Icon,
}: StatisticCardProps) {
  return (
    <StatCard
      description={description}
      icon={<Icon size={22} />}
      title={title}
      value={value}
    />
  );
}
