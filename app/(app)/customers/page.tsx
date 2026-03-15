"use client";

import { useState, useEffect, useMemo } from "react";
import { mockCustomers } from "@/data/customers";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronRight, UserRound } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";
import { format } from "date-fns";

export default function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 750);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(
    () =>
      mockCustomers.filter(
        (c) =>
          search === "" ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Patients</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {filtered.length} patient{filtered.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9 text-sm bg-white border-gray-200"
        />
      </div>

      <div data-guide="patients-table" className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                Customer
              </th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                Phone
              </th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                Total Bookings
              </th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                Last Booking
              </th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                Total Spent
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={UserRound}
                    title={search ? "No patients match your search" : "No patients yet"}
                    description={search ? `Try a different name or email.` : "Patients will appear here after their first booking."}
                  />
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold shrink-0">
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{c.phone}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                      {c.totalBookings}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {format(new Date(c.lastBooking + "T00:00:00"), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    ₹{c.totalSpent.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/customers/${c.id}`}
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
