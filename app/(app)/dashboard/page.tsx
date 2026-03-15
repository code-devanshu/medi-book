"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarCheck,
  XCircle,
  DollarSign,
  CalendarDays,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BookingsLineChart } from "@/components/dashboard/BookingsLineChart";
import { StatusPieChart } from "@/components/dashboard/StatusPieChart";
import { RevenueBarChart } from "@/components/dashboard/RevenueBarChart";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookings } from "@/store/bookingStore";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { format, subDays, startOfWeek, addDays } from "date-fns";

export default function DashboardPage() {
  const { bookings } = useBookings();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayBookings = bookings.filter((b) => b.date === today);
  const confirmed = bookings.filter((b) => b.status === "Confirmed");
  const cancelled = bookings.filter((b) => b.status === "Cancelled");
  const totalRevenue = bookings
    .filter((b) => b.status !== "Cancelled")
    .reduce((sum, b) => sum + b.price, 0);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Bookings per day — last 14 days
  const bookingsPerDay = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    return {
      date: format(d, "d MMM"),
      bookings: bookings.filter((b) => b.date === dateStr).length,
    };
  });

  // Status distribution from real bookings
  const statusDistribution = [
    { name: "Confirmed", value: bookings.filter((b) => b.status === "Confirmed").length, color: "#10b981" },
    { name: "Pending",   value: bookings.filter((b) => b.status === "Pending").length,   color: "#f59e0b" },
    { name: "Completed", value: bookings.filter((b) => b.status === "Completed").length, color: "#6366f1" },
    { name: "Cancelled", value: bookings.filter((b) => b.status === "Cancelled").length, color: "#ef4444" },
  ].filter((s) => s.value > 0);

  // Weekly revenue — last 6 weeks
  const revenueByWeek = Array.from({ length: 6 }, (_, i) => {
    const weekStart = startOfWeek(subDays(new Date(), (5 - i) * 7), { weekStartsOn: 1 });
    const weekEnd   = addDays(weekStart, 6);
    const startStr  = format(weekStart, "yyyy-MM-dd");
    const endStr    = format(weekEnd, "yyyy-MM-dd");
    const revenue   = bookings
      .filter((b) => b.date >= startStr && b.date <= endStr && b.status !== "Cancelled")
      .reduce((sum, b) => sum + b.price, 0);
    return {
      week: format(weekStart, "d MMM"),
      revenue,
      target: Math.round(revenue * 1.2),
    };
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-48 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Welcome back, Dr. Admin! Here&apos;s today&apos;s clinic overview.
        </p>
      </div>

      {/* Stats */}
      <div data-guide="dashboard-stats" className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Appointments"
          value={bookings.length}
          change="12%"
          positive
          icon={BookOpen}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatsCard
          title="Today's Appointments"
          value={todayBookings.length}
          icon={CalendarDays}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <StatsCard
          title="Confirmed"
          value={confirmed.length}
          change="8%"
          positive
          icon={CalendarCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatsCard
          title="Cancelled"
          value={cancelled.length}
          change="3%"
          positive={false}
          icon={XCircle}
          iconColor="text-red-500"
          iconBg="bg-red-50"
        />
        <StatsCard
          title="Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          change="18%"
          positive
          icon={DollarSign}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
      </div>

      {/* Charts row */}
      <div data-guide="dashboard-charts" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BookingsLineChart data={bookingsPerDay} />
        </div>
        <StatusPieChart data={statusDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueBarChart data={revenueByWeek} />
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Recent Bookings
            </h3>
            <Link
              href="/bookings"
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {booking.customerName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {booking.service} · {booking.date}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
