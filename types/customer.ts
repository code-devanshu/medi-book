export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lastBooking: string;
  totalSpent: number;
  avatar?: string;
}
