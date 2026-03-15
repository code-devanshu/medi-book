export type BookingStatus = "Confirmed" | "Pending" | "Cancelled" | "Completed";

export interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: number;
  notes?: string;
  duration?: number; // in minutes
}
