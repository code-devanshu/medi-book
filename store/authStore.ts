"use client";

import { createContext, useContext } from "react";
import { DEMO_CREDENTIALS } from "@/lib/demoAccounts";

export type UserRole = "doctor" | "office";

export interface CurrentUser {
  name:  string;
  email: string;
  role:  UserRole;
}

export interface AuthStore {
  isAuthenticated: boolean;
  currentUser: CurrentUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const MOCK_CREDENTIALS: (CurrentUser & { password: string })[] = [
  { email: "admin@medibook.in",  password: "admin123",  name: "Dr. Admin",         role: "doctor" },
  { email: "doctor@medibook.in", password: "doctor123", name: "Dr. Sharma",         role: "doctor" },
  { email: "demo@medibook.in",   password: "demo",      name: "Ananya (Reception)", role: "office" },
  // 20 demo clinic slots (doctor + office pair each) for WhatsApp outreach
  ...DEMO_CREDENTIALS,
];

/** Routes each role can access */
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  doctor: ["/dashboard", "/calendar", "/bookings", "/customers", "/analytics", "/settings"],
  office: ["/calendar", "/bookings", "/customers"],
};

/** Where to land after login */
export const ROLE_DEFAULT: Record<UserRole, string> = {
  doctor: "/dashboard",
  office: "/bookings",
};

export const AuthContext = createContext<AuthStore>({
  isAuthenticated: false,
  currentUser:     null,
  login:  async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);
