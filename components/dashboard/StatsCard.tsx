import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatsCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
  iconColor = "text-indigo-600",
  iconBg = "bg-indigo-50",
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="mt-1.5 text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                positive ? "text-emerald-600" : "text-red-500"
              )}
            >
              {positive ? "↑" : "↓"} {change} vs last month
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg", iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
    </div>
  );
}
