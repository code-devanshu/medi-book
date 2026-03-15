"use client";

import { createContext, useContext } from "react";
import { Booking } from "@/types/booking";
import { mockBookings } from "@/data/bookings";

export interface BookingStore {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
  deleteBooking: (id: string) => void;
}

export const defaultStore: BookingStore = {
  bookings: mockBookings,
  addBooking: () => {},
  updateBooking: () => {},
  cancelBooking: () => {},
  deleteBooking: () => {},
};

export const BookingContext = createContext<BookingStore>(defaultStore);

export const useBookings = () => useContext(BookingContext);
