"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, X, CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useBookings } from "@/store/bookingStore";
import { Booking, BookingStatus } from "@/types/booking";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const statusDot: Record<BookingStatus, string> = {
  Confirmed: "bg-emerald-500",
  Pending: "bg-amber-400",
  Cancelled: "bg-red-400",
  Completed: "bg-blue-500",
};

export default function CalendarPage() {
  const { bookings } = useBookings();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getBookingsForDay = (day: Date): Booking[] =>
    bookings.filter((b) => isSameDay(new Date(b.date + "T00:00:00"), day));

  const selectedBookings = selectedDay ? getBookingsForDay(selectedDay) : [];

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
        <Link href="/bookings/new">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3">
            + New Booking
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-4 px-5 py-2 bg-gray-50 border-b border-gray-100 gap-x-4 gap-y-1.5">
          {(["Confirmed", "Pending", "Cancelled", "Completed"] as BookingStatus[]).map(
            (s) => (
              <div key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={cn("w-2 h-2 rounded-full shrink-0", statusDot[s])} />
                {s}
              </div>
            )
          )}
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-gray-400 py-2.5"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div data-guide="calendar-grid" className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayBookings = getBookingsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const todayDay = isToday(day);

            return (
              <div
                key={idx}
                onClick={() =>
                  setSelectedDay(
                    selectedDay && isSameDay(day, selectedDay) ? null : day
                  )
                }
                className={cn(
                  "min-h-15 sm:min-h-20 p-1 sm:p-2 border-b border-r border-gray-50 cursor-pointer transition-colors",
                  !isCurrentMonth && "bg-gray-50/50",
                  isSelected && "bg-indigo-50",
                  !isSelected && isCurrentMonth && "hover:bg-gray-50"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-[11px] sm:text-xs mb-1",
                    todayDay
                      ? "bg-indigo-600 text-white font-semibold"
                      : isCurrentMonth
                      ? "text-gray-900"
                      : "text-gray-300"
                  )}
                >
                  {format(day, "d")}
                </div>
                {dayBookings.length > 0 && (
                  <div className="space-y-0.5">
                    {/* On mobile show only dots, on sm+ show name labels */}
                    <div className="flex flex-wrap gap-0.5 sm:hidden">
                      {dayBookings.slice(0, 3).map((b) => (
                        <span key={b.id} className={cn("w-1.5 h-1.5 rounded-full", statusDot[b.status])} />
                      ))}
                      {dayBookings.length > 3 && (
                        <span className="text-[9px] text-gray-400">+{dayBookings.length - 3}</span>
                      )}
                    </div>
                    <div className="hidden sm:block space-y-0.5">
                      {dayBookings.slice(0, 3).map((b) => (
                        <div
                          key={b.id}
                          className={cn(
                            "flex items-center gap-1 text-[10px] rounded px-1 py-0.5 truncate",
                            b.status === "Confirmed" && "bg-emerald-50 text-emerald-700",
                            b.status === "Pending" && "bg-amber-50 text-amber-700",
                            b.status === "Cancelled" && "bg-red-50 text-red-600",
                            b.status === "Completed" && "bg-blue-50 text-blue-700"
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDot[b.status])} />
                          <span className="truncate">{b.customerName.split(" ")[0]}</span>
                        </div>
                      ))}
                      {dayBookings.length > 3 && (
                        <p className="text-[10px] text-gray-400 px-1">+{dayBookings.length - 3} more</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {format(selectedDay, "EEEE, MMMM d, yyyy")}
              <span className="ml-2 text-gray-400 font-normal">
                ({selectedBookings.length} booking{selectedBookings.length !== 1 ? "s" : ""})
              </span>
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400"
              onClick={() => setSelectedDay(null)}
            >
              <X size={14} />
            </Button>
          </div>

          {selectedBookings.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No bookings for this day"
              description="Click New Booking to schedule an appointment."
            />
          ) : (
            <div className="space-y-2">
              {selectedBookings.map((b) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex flex-col items-center justify-center text-indigo-700 leading-none shrink-0">
                      <span className="text-[11px] font-bold">
                        {(() => { const [h] = b.time.split(":").map(Number); return h % 12 || 12; })()}
                      </span>
                      <span className="text-[9px] font-semibold opacity-70">
                        {parseInt(b.time) < 12 ? "AM" : "PM"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{b.customerName}</p>
                      <p className="text-xs text-gray-400">{b.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">₹{b.price.toLocaleString("en-IN")}</span>
                    <StatusBadge status={b.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
