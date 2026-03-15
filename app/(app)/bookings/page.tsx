"use client";

import { useState, useEffect, useMemo } from "react";
import { useBookings } from "@/store/bookingStore";
import { Booking, BookingStatus } from "@/types/booking";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Clock,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  Eye,
  X,
  LayoutList,
  Coffee,
  Phone,
  FileText,
  Timer,
  MoreHorizontal,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";
import { cn, formatTime } from "@/lib/utils";
import {
  format,
  isToday,
  isTomorrow,
  parseISO,
  differenceInMinutes,
  addDays,
} from "date-fns";

const PAGE_SIZE = 8;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getBookingDT(date: string, time: string): Date {
  return parseISO(`${date}T${time}:00`);
}

function timeUntilLabel(dt: Date): string {
  const now = new Date();
  const mins = differenceInMinutes(dt, now);
  if (mins < 0) return "Past";
  if (mins === 0) return "Now";
  if (mins < 60) return `In ${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (isToday(dt)) return `In ${hrs}h${rem > 0 ? ` ${rem}m` : ""}`;
  if (isTomorrow(dt)) return `Tomorrow ${format(dt, "h:mm a")}`;
  return format(dt, "EEE d MMM, h:mm a");
}

function dayLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return `Today — ${format(d, "EEEE, d MMMM")}`;
  if (isTomorrow(d)) return `Tomorrow — ${format(d, "EEEE, d MMMM")}`;
  return format(d, "EEEE, d MMMM");
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarColor(name: string): string {
  const palette = [
    "bg-indigo-100 text-indigo-700",
    "bg-violet-100 text-violet-700",
    "bg-teal-100 text-teal-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-cyan-100 text-cyan-700",
    "bg-emerald-100 text-emerald-700",
    "bg-orange-100 text-orange-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return palette[hash % palette.length];
}

function servicePill(service: string): string {
  if (
    service.includes("Physio") ||
    service.includes("TENS") ||
    service.includes("Ultrasound Therapy") ||
    service.includes("Dry Needling") ||
    service.includes("Post-Surgical")
  )
    return "bg-teal-50 text-teal-700 border-teal-100";
  if (
    service.includes("Blood") ||
    service.includes("CBC") ||
    service.includes("Lipid") ||
    service.includes("LFT") ||
    service.includes("KFT") ||
    service.includes("Thyroid") ||
    service.includes("Urine") ||
    service.includes("HbA1c") ||
    service.includes("Dengue") ||
    service.includes("Sugar")
  )
    return "bg-violet-50 text-violet-700 border-violet-100";
  if (
    service.includes("X-Ray") ||
    service.includes("USG") ||
    service.includes("ECG") ||
    service.includes("Ultrasound Abdomen") ||
    service.includes("2D Echo")
  )
    return "bg-orange-50 text-orange-700 border-orange-100";
  return "bg-indigo-50 text-indigo-700 border-indigo-100";
}

function statusBorder(status: BookingStatus): string {
  switch (status) {
    case "Confirmed":
      return "border-l-indigo-500";
    case "Pending":
      return "border-l-amber-400";
    case "Completed":
      return "border-l-emerald-500";
    case "Cancelled":
      return "border-l-red-300";
  }
}

// ─── Appointment Card ────────────────────────────────────────────────────────

function AppointmentCard({
  booking,
  onConfirm,
  onComplete,
  onCancel,
}: {
  booking: Booking;
  onConfirm: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const dt = getBookingDT(booking.date, booking.time);
  const mins = differenceInMinutes(dt, new Date());
  const isUrgent = mins >= 0 && mins <= 30;
  const isPast = mins < 0;

  return (
    <div
      className={cn(
        "bg-white border border-gray-100 border-l-4 rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-4 hover:shadow-md transition-all duration-200 group",
        statusBorder(booking.status as BookingStatus),
        booking.status === "Cancelled" && "opacity-60",
        booking.status === "Completed" && "bg-gray-50/50"
      )}
    >
      {/* Time column — sm+ only */}
      <div className="hidden sm:block min-w-[48px] text-center shrink-0">
        <p
          className={cn(
            "text-base font-bold leading-tight",
            isUrgent ? "text-orange-600" : "text-gray-900"
          )}
        >
          {formatTime(booking.time)}
        </p>
        <div className="flex items-center justify-center gap-0.5 mt-1">
          <Timer size={9} className="text-gray-300" />
          <span className="text-[10px] text-gray-400">{booking.duration}m</span>
        </div>
        {isUrgent && (
          <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wide">
            Soon
          </span>
        )}
      </div>

      {/* Divider — sm+ only */}
      <div className="hidden sm:block w-px self-stretch bg-gray-100 shrink-0" />

      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
          avatarColor(booking.customerName)
        )}
      >
        {initials(booking.customerName)}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Name row: name + status + price on right */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">
                {booking.customerName}
              </span>
              <StatusBadge status={booking.status as BookingStatus} />
              {isUrgent && !isPast && (
                <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                  {mins === 0 ? "Now" : `${mins} min`}
                </span>
              )}
            </div>
            {/* Mobile: time + duration below name */}
            <div className="flex items-center gap-1 mt-0.5 sm:hidden">
              <Timer size={9} className="text-gray-300" />
              <span className="text-xs text-gray-400">
                {formatTime(booking.time)} · {booking.duration}m
              </span>
              {isUrgent && (
                <span className="text-[9px] font-bold text-orange-500 uppercase">Soon</span>
              )}
            </div>
          </div>
          {/* Price — always visible */}
          <p className="text-sm font-semibold text-gray-900 shrink-0">
            ₹{booking.price.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Service pill */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full border font-medium",
              servicePill(booking.service)
            )}
          >
            {booking.service}
          </span>
        </div>

        {/* Bottom row: phone (+ notes on sm+) + actions */}
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            {booking.notes && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                <FileText size={10} className="shrink-0" />
                <span className="truncate max-w-[180px]">{booking.notes}</span>
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Phone size={10} className="shrink-0" />
              {booking.phone}
            </span>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Link href={`/bookings/${booking.id}`}>
              <button
                title="View details"
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <Eye size={13} />
              </button>
            </Link>

            {booking.status === "Pending" && (
              <button
                title="Confirm appointment"
                onClick={() => onConfirm(booking.id)}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 transition-colors"
              >
                <UserCheck size={13} />
              </button>
            )}

            {booking.status === "Confirmed" && (
              <button
                title="Mark as completed"
                onClick={() => onComplete(booking.id)}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
              >
                <CheckCircle2 size={13} />
              </button>
            )}

            {(booking.status === "Pending" || booking.status === "Confirmed") && (
              <button
                title="Cancel booking"
                onClick={() => onCancel(booking.id)}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const { bookings, cancelBooking, updateBooking } = useBookings();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"schedule" | "list">("schedule");
  const [activeFilter, setActiveFilter] = useState<"today" | "pending" | "week" | "next">("today");

  // List view state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // Dialogs
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Live clock for countdown
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const weekEndStr = format(addDays(new Date(), 7), "yyyy-MM-dd");

  // Upcoming non-cancelled bookings sorted by datetime
  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => b.date >= todayStr && b.status !== "Cancelled")
        .sort(
          (a, b) =>
            getBookingDT(a.date, a.time).getTime() -
            getBookingDT(b.date, b.time).getTime()
        ),
    [bookings, todayStr]
  );

  // Next appointment must be in the future (not yet started)
  const nextAppointment =
    upcoming.find((b) => getBookingDT(b.date, b.time) > now) ?? null;

  // Fallback: first booking from a future date (tomorrow or later) when nothing is left today
  const nextDayAppointment = nextAppointment
    ? null
    : upcoming.find((b) => b.date > todayStr) ?? null;

  const todayBookings = useMemo(
    () => bookings.filter((b) => b.date === todayStr),
    [bookings, todayStr]
  );

  const todayActive = todayBookings.filter(
    (b) => b.status !== "Cancelled"
  ).length;
  const todayCompleted = todayBookings.filter(
    (b) => b.status === "Completed"
  ).length;
  const todayRemaining = todayBookings.filter(
    (b) => b.status === "Confirmed" || b.status === "Pending"
  ).length;

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === "Pending").length,
    [bookings]
  );

  const weekBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.date >= todayStr &&
          b.date <= weekEndStr &&
          b.status !== "Cancelled"
      ),
    [bookings, todayStr, weekEndStr]
  );

  const weekRevenue = weekBookings.reduce((s, b) => s + b.price, 0);

  // Bookings to display in schedule view, driven by activeFilter
  const filteredForSchedule = useMemo(() => {
    const sorted = (arr: Booking[]) =>
      [...arr].sort(
        (a, b) =>
          getBookingDT(a.date, a.time).getTime() -
          getBookingDT(b.date, b.time).getTime()
      );
    switch (activeFilter) {
      case "today":
        return sorted(
          bookings.filter((b) => b.date === todayStr && b.status !== "Cancelled")
        );
      case "pending":
        return sorted(bookings.filter((b) => b.status === "Pending"));
      case "week":
        return sorted(weekBookings);
      case "next":
        if (!nextAppointment) return [];
        return sorted(
          bookings.filter(
            (b) => b.date === nextAppointment.date && b.status !== "Cancelled"
          )
        );
    }
  }, [activeFilter, bookings, todayStr, weekBookings, nextAppointment]);

  // Group the filtered bookings by date
  const activeGroups = useMemo(() => {
    const groups: Record<string, Booking[]> = {};
    filteredForSchedule.forEach((b) => {
      if (!groups[b.date]) groups[b.date] = [];
      groups[b.date].push(b);
    });
    return groups;
  }, [filteredForSchedule]);

  const activeDates = Object.keys(activeGroups).sort();

  // Today section empty state (only relevant for "today" filter)
  const showTodayEmpty = activeFilter === "today" && !activeGroups[todayStr];

  // "All caught up" — today has appointments but all are completed/cancelled
  const todayDone = useMemo(() => {
    if (activeFilter !== "today") return false;
    const todayGroup = activeGroups[todayStr];
    if (!todayGroup || todayGroup.length === 0) return false;
    return todayGroup.every((b) => b.status === "Completed" || b.status === "Cancelled");
  }, [activeFilter, activeGroups, todayStr]);

  // List view filtering
  const filtered = useMemo(() => {
    return bookings
      .filter((b) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          b.customerName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.service.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q);
        const matchStatus =
          statusFilter === "all" || b.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        const diff =
          getBookingDT(a.date, a.time).getTime() -
          getBookingDT(b.date, b.time).getTime();
        return sortDir === "asc" ? diff : -diff;
      });
  }, [bookings, search, statusFilter, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    await new Promise((r) => setTimeout(r, 600));
    cancelBooking(cancelId);
    setCancelling(false);
    setCancelId(null);
    toast.success("Appointment cancelled");
  };

  const handleComplete = async () => {
    if (!completeId) return;
    setCompleting(true);
    await new Promise((r) => setTimeout(r, 500));
    updateBooking(completeId, { status: "Completed" });
    setCompleting(false);
    setCompleteId(null);
    toast.success("Marked as completed", {
      description: "Patient visit recorded.",
    });
  };

  const handleConfirm = async () => {
    if (!confirmId) return;
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 400));
    updateBooking(confirmId, { status: "Confirmed" });
    setConfirming(false);
    setConfirmId(null);
    toast.success("Appointment confirmed", {
      description: "Patient will be notified.",
    });
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div data-guide="appointments-table" className="space-y-5">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Appointments
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              <span className="hidden sm:inline">{format(new Date(), "EEEE, d MMMM yyyy")}</span>
              <span className="sm:hidden">{format(new Date(), "EEE, d MMM")}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setView("schedule")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  view === "schedule"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <CalendarDays size={13} />
                <span className="hidden sm:inline">Schedule</span>
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  view === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <LayoutList size={13} />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
            <Link href="/bookings/new">
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 gap-1.5"
              >
                <Plus size={13} />
                <span className="hidden sm:inline">New Booking</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Filter Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

          {/* Next Up — always gradient, always prominent */}
          {(() => {
            const nextDT = nextAppointment
              ? getBookingDT(nextAppointment.date, nextAppointment.time)
              : null;
            const minsAway = nextDT
              ? differenceInMinutes(nextDT, now)
              : null;
            const isUrgent = minsAway !== null && minsAway >= 0 && minsAway <= 30;

            return (
              <button
                onClick={() => { setActiveFilter("next"); setView("schedule"); }}
                className={cn(
                  "rounded-xl p-4 text-left text-white relative overflow-hidden transition-all duration-200 cursor-pointer",
                  "bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600",
                  activeFilter === "next"
                    ? "shadow-lg shadow-indigo-200 ring-2 ring-indigo-300 ring-offset-1 scale-[1.01]"
                    : "shadow-md hover:shadow-lg hover:scale-[1.005]"
                )}
              >
                {/* Decorative blobs */}
                <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -bottom-6 -left-3 w-16 h-16 rounded-full bg-violet-400/20 pointer-events-none" />

                {/* Selected indicator */}
                {activeFilter === "next" && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-white/25 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                )}

                <div className="relative">
                  {/* Label row */}
                  <div className="flex items-center gap-1.5 mb-3">
                    {isUrgent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shrink-0" />
                    ) : (
                      <Clock size={12} className="opacity-50 shrink-0" />
                    )}
                    <span className="text-[10px] font-semibold opacity-60 uppercase tracking-widest">
                      Next Up
                    </span>
                  </div>

                  {nextAppointment && nextDT ? (
                    <div className="flex items-end gap-3">
                      {/* Countdown — hero element */}
                      <div className={cn(
                        "shrink-0 rounded-lg px-2.5 py-1.5 text-center min-w-[52px]",
                        isUrgent ? "bg-orange-400/30" : "bg-white/15"
                      )}>
                        <p className={cn(
                          "text-lg font-black leading-none tracking-tight",
                          isUrgent ? "text-orange-200" : "text-white"
                        )}>
                          {minsAway === 0
                            ? "Now"
                            : minsAway !== null && minsAway < 60
                            ? `${minsAway}m`
                            : minsAway !== null
                            ? `${Math.floor(minsAway / 60)}h`
                            : "—"}
                        </p>
                        {minsAway !== null && minsAway >= 60 && (
                          <p className="text-[9px] opacity-60 mt-0.5 leading-none">
                            {minsAway % 60 > 0 ? `${minsAway % 60}m` : "away"}
                          </p>
                        )}
                        {minsAway !== null && minsAway < 0 && (
                          <p className="text-[9px] opacity-60 mt-0.5 leading-none">past</p>
                        )}
                      </div>

                      {/* Patient info */}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight truncate">
                          {nextAppointment.customerName}
                        </p>
                        <p className="text-[11px] opacity-65 mt-0.5 truncate leading-tight">
                          {nextAppointment.service}
                        </p>
                        <p className="text-[10px] opacity-45 mt-1 leading-none">
                          {formatTime(nextAppointment.time)} · {nextAppointment.duration}m
                        </p>
                      </div>
                    </div>
                  ) : nextDayAppointment ? (
                    <div className="flex items-end gap-3">
                      <div className="shrink-0 rounded-lg px-2.5 py-1.5 text-center min-w-13 bg-white/15">
                        <p className="text-lg font-black leading-none tracking-tight text-white">
                          {formatTime(nextDayAppointment.time).split(" ")[0]}
                        </p>
                        <p className="text-[9px] opacity-60 mt-0.5 leading-none">
                          {formatTime(nextDayAppointment.time).split(" ")[1]}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight truncate">
                          {nextDayAppointment.customerName}
                        </p>
                        <p className="text-[11px] opacity-65 mt-0.5 truncate leading-tight">
                          {nextDayAppointment.service}
                        </p>
                        <p className="text-[10px] opacity-45 mt-1 leading-none">
                          {format(new Date(nextDayAppointment.date), "d MMM")} · {nextDayAppointment.duration}m
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm opacity-60 mt-1">No upcoming appointments</p>
                  )}
                </div>
              </button>
            );
          })()}

          {/* Today */}
          <button
            onClick={() => { setActiveFilter("today"); setView("schedule"); }}
            className={cn(
              "rounded-xl p-4 text-left transition-all duration-150 cursor-pointer ring-offset-1",
              activeFilter === "today"
                ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300"
                : "bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-sm"
            )}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <CalendarDays size={13} className={activeFilter === "today" ? "opacity-60" : "text-gray-400"} />
              <span className={cn("text-[10px] font-semibold uppercase tracking-widest", activeFilter === "today" ? "opacity-60" : "text-gray-400")}>
                Today
              </span>
            </div>
            <p className={cn("text-2xl font-bold", activeFilter !== "today" && "text-gray-900")}>{todayActive}</p>
            <p className={cn("text-xs mt-0.5", activeFilter === "today" ? "opacity-75" : "text-gray-400")}>
              {todayCompleted > 0 ? `${todayCompleted} done` : ""}
              {todayCompleted > 0 && todayRemaining > 0 ? " · " : ""}
              {todayRemaining > 0 ? `${todayRemaining} remaining` : ""}
              {todayActive === 0 ? "Clear day" : ""}
            </p>
          </button>

          {/* Pending */}
          <button
            onClick={() => { setActiveFilter("pending"); setView("schedule"); }}
            className={cn(
              "rounded-xl p-4 text-left transition-all duration-150 cursor-pointer ring-offset-1",
              activeFilter === "pending"
                ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300"
                : "bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-sm"
            )}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <AlertCircle size={13} className={activeFilter === "pending" ? "opacity-60" : "text-amber-400"} />
              <span className={cn("text-[10px] font-semibold uppercase tracking-widest", activeFilter === "pending" ? "opacity-60" : "text-gray-400")}>
                Pending
              </span>
            </div>
            <p className={cn("text-2xl font-bold", activeFilter !== "pending" && "text-gray-900")}>{pendingCount}</p>
            <p className={cn("text-xs mt-0.5", activeFilter === "pending" ? "opacity-75" : "text-gray-400")}>
              {pendingCount === 0 ? "All confirmed" : "Awaiting confirmation"}
            </p>
          </button>

          {/* This Week */}
          <button
            onClick={() => { setActiveFilter("week"); setView("schedule"); }}
            className={cn(
              "rounded-xl p-4 text-left transition-all duration-150 cursor-pointer ring-offset-1",
              activeFilter === "week"
                ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300"
                : "bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-sm"
            )}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <CalendarClock size={13} className={activeFilter === "week" ? "opacity-60" : "text-gray-400"} />
              <span className={cn("text-[10px] font-semibold uppercase tracking-widest", activeFilter === "week" ? "opacity-60" : "text-gray-400")}>
                This Week
              </span>
            </div>
            <p className={cn("text-2xl font-bold", activeFilter !== "week" && "text-gray-900")}>{weekBookings.length}</p>
            <p className={cn("text-xs mt-0.5", activeFilter === "week" ? "opacity-75" : "text-gray-400")}>
              ₹{weekRevenue.toLocaleString("en-IN")} est.
            </p>
          </button>
        </div>

        {/* ── Schedule View ─────────────────────────────────────────────────── */}
        {view === "schedule" && (
          <div className="space-y-6">
            {/* Today empty state — only for "today" filter */}
            {showTodayEmpty && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    {dayLabel(todayStr)}
                  </p>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">0 appointments</span>
                </div>
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center">
                  <Coffee size={20} className="text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">
                    No appointments today
                  </p>
                  <p className="text-xs text-gray-400">
                    Your next appointment is{" "}
                    {nextAppointment
                      ? timeUntilLabel(
                          getBookingDT(nextAppointment.date, nextAppointment.time)
                        ).toLowerCase()
                      : "not scheduled yet"}
                    .
                  </p>
                </div>
              </div>
            )}

            {/* All caught up — today's appointments all done */}
            {todayDone && (
              <div className="bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-8 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={22} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">All caught up for today!</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    {todayBookings.filter((b) => b.status === "Completed").length} patients seen today.
                    {nextAppointment ? ` Next appointment ${timeUntilLabel(getBookingDT(nextAppointment.date, nextAppointment.time)).toLowerCase()}.` : " Great work!"}
                  </p>
                </div>
                <Link href="/bookings/new" className="text-xs text-emerald-700 font-medium hover:underline mt-1">
                  + Schedule tomorrow
                </Link>
              </div>
            )}

            {/* Date groups */}
            {activeDates.map((dateStr) => {
              const dayBookings = activeGroups[dateStr];
              return (
                <div key={dateStr}>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                      {dayLabel(dateStr)}
                    </p>
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400">
                      {dayBookings.length} appointment
                      {dayBookings.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {dayBookings.map((booking) => (
                      <AppointmentCard
                        key={booking.id}
                        booking={booking}
                        onConfirm={setConfirmId}
                        onComplete={setCompleteId}
                        onCancel={setCancelId}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Generic empty state for non-today filters */}
            {activeDates.length === 0 && !showTodayEmpty && !todayDone && (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center gap-2 text-center">
                <Coffee size={20} className="text-gray-300" />
                <p className="text-sm font-medium text-gray-500">
                  {activeFilter === "pending" && "No pending appointments"}
                  {activeFilter === "week" && "No appointments this week"}
                  {activeFilter === "next" && "No upcoming appointments"}
                </p>
                <Link href="/bookings/new" className="text-xs text-indigo-600 hover:underline">
                  Book one now
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── List View ─────────────────────────────────────────────────────── */}
        {view === "list" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <Input
                  placeholder="Search name, ID, service..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 h-9 text-sm bg-white border-gray-200"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v ?? "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36 h-9 text-sm border-gray-200 bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <p className="self-center text-xs text-gray-400 ml-auto">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-24">
                        ID
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        Patient
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        Service
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        <button
                          onClick={() =>
                            setSortDir((d) => (d === "desc" ? "asc" : "desc"))
                          }
                          className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                        >
                          Date & Time <ArrowUpDown size={11} />
                        </button>
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        Fee
                      </th>
                      <th className="px-4 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginated.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center text-sm text-gray-400 py-14"
                        >
                          No appointments match your filters.
                        </td>
                      </tr>
                    ) : (
                      paginated.map((booking) => (
                        <tr
                          key={booking.id}
                          className="hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/bookings/${booking.id}`}
                              className="font-mono text-xs text-indigo-600 hover:underline font-medium"
                            >
                              {booking.id}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={cn(
                                  "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                                  avatarColor(booking.customerName)
                                )}
                              >
                                {initials(booking.customerName)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm leading-tight">
                                  {booking.customerName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {booking.phone}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full border font-medium",
                                servicePill(booking.service)
                              )}
                            >
                              {booking.service}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-700 font-medium whitespace-nowrap">
                              {format(parseISO(booking.date), "d MMM yyyy")}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatTime(booking.time)} · {booking.duration}m
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge
                              status={booking.status as BookingStatus}
                            />
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900 text-sm">
                            ₹{booking.price.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                <MoreHorizontal size={14} />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-44 text-sm"
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    (window.location.href = `/bookings/${booking.id}`)
                                  }
                                >
                                  View details
                                </DropdownMenuItem>
                                {booking.status !== "Completed" &&
                                  booking.status !== "Cancelled" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setCompleteId(booking.id)
                                      }
                                    >
                                      Mark as completed
                                    </DropdownMenuItem>
                                  )}
                                {booking.status !== "Cancelled" && (
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => setCancelId(booking.id)}
                                  >
                                    Cancel booking
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Showing {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                    {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft size={14} />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={cn(
                            "h-7 w-7 rounded-md text-xs font-medium transition-colors",
                            p === page
                              ? "bg-indigo-600 text-white"
                              : "text-gray-500 hover:bg-gray-100"
                          )}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Cancel Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={!!cancelId} onOpenChange={(o) => !o && setCancelId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              This will free the time slot and notify the patient. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelId(null)}
              disabled={cancelling}
            >
              Keep
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling…" : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Complete Dialog ───────────────────────────────────────────────── */}
      <Dialog
        open={!!completeId}
        onOpenChange={(o) => !o && setCompleteId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark as Completed?</DialogTitle>
            <DialogDescription>
              Confirm that this appointment has been completed and the patient
              has been seen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompleteId(null)}
              disabled={completing}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? "Saving…" : "Mark Completed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Dialog ────────────────────────────────────────────────── */}
      <Dialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Appointment?</DialogTitle>
            <DialogDescription>
              This will confirm the booking and notify the patient that their
              appointment is approved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmId(null)}
              disabled={confirming}
            >
              Not yet
            </Button>
            <Button
              size="sm"
              className="bg-sky-600 hover:bg-sky-700 text-white"
              onClick={handleConfirm}
              disabled={confirming}
            >
              {confirming ? "Confirming…" : "Yes, Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
