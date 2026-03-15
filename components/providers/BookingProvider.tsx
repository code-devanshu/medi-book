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
  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window === "undefined") return mockBookings;
    return loadOrGenerateBookings();
  });

  // Keep localStorage in sync after every mutation
  useEffect(() => {
    persistBookings(bookings);
  }, [bookings]);

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
