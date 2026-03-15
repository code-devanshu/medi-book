import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@/types/booking";
import { cn } from "@/lib/utils";

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  Confirmed: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600 border-red-200",
  },
  Completed: {
    label: "Completed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium px-2 py-0.5", config.className)}
    >
      {config.label}
    </Badge>
  );
}
