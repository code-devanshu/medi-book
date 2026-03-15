"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AuthContext,
  CurrentUser,
  MOCK_CREDENTIALS,
  ROLE_DEFAULT,
} from "@/store/authStore";

const AUTH_KEY = "medibook_auth";
const USER_KEY = "medibook_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const router = useRouter();

  // Rehydrate from localStorage on mount
  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === "true") {
      setIsAuthenticated(true);
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        try { setCurrentUser(JSON.parse(raw)); } catch {}
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 900));
    const match = MOCK_CREDENTIALS.find(
      (c) => c.email === email.trim().toLowerCase() && c.password === password
    );
    if (match) {
      const user: CurrentUser = { name: match.name, email: match.email, role: match.role };
      localStorage.setItem(AUTH_KEY, "true");
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setIsAuthenticated(true);
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("medibook_guide_dismissed");
    setIsAuthenticated(false);
    setCurrentUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
