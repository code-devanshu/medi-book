"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/authStore";
import { ROLE_ROUTES, ROLE_DEFAULT } from "@/store/authStore";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait a tick for localStorage rehydration
    const t = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }
      if (!currentUser) return;

      // Check if current path is allowed for the user's role
      const allowed = ROLE_ROUTES[currentUser.role];
      const canAccess = allowed.some((r) => pathname.startsWith(r));
      if (!canAccess) {
        router.replace(ROLE_DEFAULT[currentUser.role]);
      }
    }, 50);
    return () => clearTimeout(t);
  }, [isAuthenticated, currentUser, pathname, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
