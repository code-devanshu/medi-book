"use client";

import { use, useEffect, useState } from "react";
import { mockCustomers } from "@/data/customers";
import { useBookings } from "@/store/bookingStore";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Mail, Phone, BookOpen, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingStatus } from "@/types/booking";
import { format } from "date-fns";
import { formatTime } from "@/lib/utils";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { bookings } = useBookings();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const customer = mockCustomers.find((c) => c.id === id);
  const customerBookings = customer
    ? bookings.filter(
        (b) =>
          b.customerName === customer.name || b.email === customer.email
      )
    : [];

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Customer not found.</p>
        <Link href="/customers">
          <Button variant="outline" size="sm" className="mt-4">
            Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  const totalSpent = customerBookings
    .filter((b) => b.status !== "Cancelled")
    .reduce((sum, b) => sum + b.price, 0);

  return (
    <div className="max-w-2xl space-y-5">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-lg font-semibold shrink-0">
            {customer.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {customer.name}
            </h1>
            <div className="flex flex-wrap gap-3 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Mail size={12} /> {customer.email}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Phone size={12} /> {customer.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-1">
              <BookOpen size={12} /> Bookings
            </div>
            <p className="text-xl font-semibold text-gray-900">
              {customerBookings.length}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-1">
              <DollarSign size={12} /> Total Spent
            </div>
            <p className="text-xl font-semibold text-gray-900">
              ₹{totalSpent.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-1">
              <Calendar size={12} /> Last Visit
            </div>
            <p className="text-sm font-medium text-gray-900">
              {format(new Date(customer.lastBooking + "T00:00:00"), "MMM d")}
            </p>
          </div>
        </div>
      </div>

      {/* Bookings history */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Booking History
        </h2>
        {customerBookings.length === 0 ? (
          <p className="text-sm text-gray-400">No bookings found.</p>
        ) : (
          <div className="space-y-2">
            {customerBookings
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((b) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-mono">
                      {formatTime(b.time)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {b.service}
                      </p>
                      <p className="text-xs text-gray-400">{b.id} · {b.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      ₹{b.price.toLocaleString("en-IN")}
                    </span>
                    <StatusBadge status={b.status as BookingStatus} />
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
