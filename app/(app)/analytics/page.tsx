"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, BarChart3, Users } from "lucide-react";
import { useBookings } from "@/store/bookingStore";
import { format, subDays, startOfWeek, addDays, subWeeks } from "date-fns";

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  fontSize: "12px",
};

export default function AnalyticsPage() {
  const { bookings } = useBookings();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  // ── Computed analytics from real bookings ──────────────────────────────────

  const bookingsPerDay = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => {
      const d = subDays(new Date(), 14 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      return {
        date: format(d, "d MMM"),
        bookings: bookings.filter((b) => b.date === dateStr).length,
      };
    }), [bookings]);

  const revenueByWeek = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
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
    }), [bookings]);

  const servicePopularity = useMemo(() => {
    const map = new Map<string, { bookings: number; revenue: number }>();
    bookings.forEach((b) => {
      const prev = map.get(b.service) ?? { bookings: 0, revenue: 0 };
      map.set(b.service, {
        bookings: prev.bookings + 1,
        revenue: prev.revenue + (b.status !== "Cancelled" ? b.price : 0),
      });
    });
    return Array.from(map.entries())
      .map(([service, data]) => ({ service, ...data }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 8);
  }, [bookings]);

  const cancellationTrend = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(new Date(), 5 - i), { weekStartsOn: 1 });
      const weekEnd   = addDays(weekStart, 6);
      const startStr  = format(weekStart, "yyyy-MM-dd");
      const endStr    = format(weekEnd, "yyyy-MM-dd");
      const week      = bookings.filter((b) => b.date >= startStr && b.date <= endStr);
      const cancelled = week.filter((b) => b.status === "Cancelled").length;
      const rate      = week.length > 0 ? Math.round((cancelled / week.length) * 100) : 0;
      return { month: format(weekStart, "d MMM"), cancellations: cancelled, rate };
    }), [bookings]);

  // Summary stats
  const totalRevenue = bookings
    .filter((b) => b.status !== "Cancelled")
    .reduce((sum, b) => sum + b.price, 0);

  const avgDaily = bookingsPerDay.length > 0
    ? (bookingsPerDay.reduce((s, d) => s + d.bookings, 0) / bookingsPerDay.length).toFixed(1)
    : "0";

  const cancelCount = bookings.filter((b) => b.status === "Cancelled").length;
  const cancelRate  = bookings.length > 0
    ? Math.round((cancelCount / bookings.length) * 100)
    : 0;

  // Unique customers by phone
  const uniqueCustomers = new Set(bookings.map((b) => b.phone)).size;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-7 w-36" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Performance overview based on your actual booking data
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Avg Daily Bookings"
          value={avgDaily}
          sub="Last 15 days"
          icon={<BarChart3 size={16} className="text-indigo-600" />}
          bg="bg-indigo-50"
          positive
        />
        <SummaryCard
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          sub="Excl. cancelled"
          icon={<TrendingUp size={16} className="text-emerald-600" />}
          bg="bg-emerald-50"
          positive
        />
        <SummaryCard
          label="Unique Patients"
          value={String(uniqueCustomers)}
          sub="By phone number"
          icon={<Users size={16} className="text-violet-600" />}
          bg="bg-violet-50"
          positive
        />
        <SummaryCard
          label="Cancellation Rate"
          value={`${cancelRate}%`}
          sub={`${cancelCount} cancelled`}
          icon={<TrendingDown size={16} className="text-rose-600" />}
          bg="bg-rose-50"
          positive={cancelRate < 15}
        />
      </div>

      {/* Charts */}
      <div data-guide="analytics-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily bookings area chart */}
        <ChartCard title="Daily Bookings Trend">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={bookingsPerDay} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={2} fill="url(#bookingsGrad)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue growth */}
        <ChartCard title="Revenue Growth (Weekly)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByWeek} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, undefined]} contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Service popularity */}
        <ChartCard title="Service Popularity (Bookings)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={servicePopularity} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="service" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="bookings" fill="#818cf8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cancellation trend */}
        <ChartCard title="Cancellation Rate Trend (%)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={cancellationTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip formatter={(v) => [`${Number(v)}%`, undefined]} contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="rate" name="Cancellation Rate" stroke="#f43f5e" strokeWidth={2} dot={{ fill: "#f43f5e", r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="cancellations" name="Cancellations" stroke="#fb923c" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Service revenue table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Service Revenue Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 pb-2">Service</th>
                <th className="text-right text-xs font-medium text-gray-500 pb-2">Bookings</th>
                <th className="text-right text-xs font-medium text-gray-500 pb-2">Revenue</th>
                <th className="text-right text-xs font-medium text-gray-500 pb-2 pr-2">Share</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-2 pl-4 w-40">Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {servicePopularity.map((s) => {
                const maxRev    = Math.max(...servicePopularity.map((x) => x.revenue), 1);
                const totalRev  = servicePopularity.reduce((a, x) => a + x.revenue, 0);
                const pct       = totalRev > 0 ? Math.round((s.revenue / totalRev) * 100) : 0;
                return (
                  <tr key={s.service} className="hover:bg-gray-50/60">
                    <td className="py-2.5 font-medium text-gray-800">{s.service}</td>
                    <td className="py-2.5 text-right text-gray-500">{s.bookings}</td>
                    <td className="py-2.5 text-right font-medium text-gray-900">₹{s.revenue.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 text-right text-gray-500 pr-2">{pct}%</td>
                    <td className="py-2.5 pl-4">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(s.revenue / maxRev) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, icon, bg, positive }: {
  label: string; value: string; sub: string; icon: React.ReactNode; bg: string; positive: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <div className={`p-1.5 rounded-lg ${bg}`}>{icon}</div>
      </div>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
      <p className={`text-xs mt-0.5 font-medium ${positive ? "text-emerald-600" : "text-red-500"}`}>{sub}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}
