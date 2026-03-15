"use client";

import { useState, useEffect, ReactNode } from "react";
import { Booking } from "@/types/booking";
import { mockBookings } from "@/data/bookings";
import { BookingContext } from "@/store/bookingStore";
import {
  loadOrGenerateBookings,
  persistBookings,
} from "@/data/generateBookings";

export function BookingProvider({ children }: { children: ReactNode }) {
  // Start with static mockBookings so the first SSR/paint has real data,
  // then swap to localStorage-backed dynamic data on the client.
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [hydrated, setHydrated] = useState(false);

  // On mount: wipe stale localStorage and load/generate today-relative data
  useEffect(() => {
    const loaded = loadOrGenerateBookings();
    setBookings(loaded);
    setHydrated(true);
  }, []);

  // Keep localStorage in sync after every mutation
  useEffect(() => {
    if (!hydrated) return;
    persistBookings(bookings);
  }, [bookings, hydrated]);

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b))
    );
  };

  const deleteBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <BookingContext.Provider
      value={{ bookings, addBooking, updateBooking, cancelBooking, deleteBooking }}
    >
      {children}
    </BookingContext.Provider>
  );
}
