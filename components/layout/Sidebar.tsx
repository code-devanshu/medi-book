"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  UserRound,
  BarChart3,
  Settings,
  Stethoscope,
  LogOut,
  X,
  Stethoscope as DoctorIcon,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth, UserRole } from "@/store/authStore";

const ALL_NAV = [
  { href: "/dashboard",  label: "Dashboard",    icon: LayoutDashboard, roles: ["doctor"]           },
  { href: "/calendar",   label: "Calendar",     icon: Calendar,        roles: ["doctor", "office"] },
  { href: "/bookings",   label: "Appointments", icon: BookOpen,        roles: ["doctor", "office"] },
  { href: "/customers",  label: "Patients",     icon: UserRound,       roles: ["doctor", "office"] },
  { href: "/analytics",  label: "Analytics",    icon: BarChart3,       roles: ["doctor"]           },
  { href: "/settings",   label: "Settings",     icon: Settings,        roles: ["doctor"]           },
] as const;

const ROLE_LABEL: Record<UserRole, string> = {
  doctor: "Doctor",
  office: "Office Staff",
};

const ROLE_COLORS: Record<UserRole, string> = {
  doctor: "bg-indigo-100 text-indigo-700",
  office: "bg-teal-100 text-teal-700",
};

function userInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, currentUser } = useAuth();

  const role = currentUser?.role ?? "office";
  const visibleNav = ALL_NAV.filter((item) =>
    (item.roles as readonly string[]).includes(role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <Link
            href={role === "doctor" ? "/dashboard" : "/bookings"}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Stethoscope size={17} className="text-white" />
            </div>
            <div>
              <span className="text-[15px] font-semibold text-gray-900">
                MediBook
              </span>
              <span className="block text-[10px] text-gray-400 leading-none -mt-0.5">
                Clinic Management
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-7 w-7"
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon
                  size={18}
                  className={active ? "text-indigo-600" : "text-gray-400"}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info + sign out */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          <div className="flex items-center gap-3 px-2 py-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                ROLE_COLORS[role]
              )}
            >
              {currentUser ? userInitials(currentUser.name) : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser?.name ?? "User"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none",
                    ROLE_COLORS[role]
                  )}
                >
                  {ROLE_LABEL[role]}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} className="text-gray-400" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
