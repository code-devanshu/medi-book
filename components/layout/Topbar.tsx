"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, Menu, Sparkles, CheckCircle2, Clock, UserPlus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDemoGuide } from "@/store/demoGuideStore";
import { useAuth } from "@/store/authStore";
import { cn } from "@/lib/utils";

const NOTIFICATIONS = [
  {
    id: 1,
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    title: "Appointment Confirmed",
    body: "Priya Verma confirmed for tomorrow at 8:00 AM",
    time: "2m ago",
    read: false,
  },
  {
    id: 2,
    icon: UserPlus,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
    title: "New Patient Registered",
    body: "Rahul Mehta booked General Physician Consultation",
    time: "18m ago",
    read: false,
  },
  {
    id: 3,
    icon: Clock,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    title: "Pending Approval",
    body: "2 bookings are awaiting confirmation",
    time: "1h ago",
    read: false,
  },
  {
    id: 4,
    icon: XCircle,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
    title: "Appointment Cancelled",
    body: "Ananya Singh cancelled her 2:00 PM slot",
    time: "3h ago",
    read: true,
  },
];

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { startGuide, isOpen } = useDemoGuide();
  const { currentUser } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read && !readIds.has(n.id)).length;

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleOpenNotif = () => {
    setNotifOpen((v) => !v);
    // Mark all as read when opened
    if (!notifOpen) {
      setReadIds(new Set(NOTIFICATIONS.map((n) => n.id)));
    }
  };

  // Avatar initials from currentUser
  const initials = currentUser?.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "??";

  return (
    <header className="sticky top-0 z-10 h-16 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-8 w-8 text-gray-500"
        onClick={onMenuClick}
      >
        <Menu size={18} />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <Input
          placeholder="Search appointments, patients..."
          className="pl-9 h-9 bg-gray-50 border-gray-200 text-sm focus-visible:ring-indigo-500 rounded-lg"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Demo badge */}
        <Badge
          variant="secondary"
          className="hidden sm:flex bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium px-2.5 py-0.5 rounded-full"
        >
          Demo Mode
        </Badge>

        {/* Start Tour button */}
        <button
          onClick={startGuide}
          title="Start demo tour"
          className={`hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-all ${
            isOpen
              ? "bg-indigo-600 text-white border-indigo-600"
              : "border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
          }`}
        >
          <Sparkles size={13} />
          {isOpen ? "Tour active" : "Take a tour"}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 text-gray-500"
            onClick={handleOpenNotif}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold leading-none">
                {unreadCount}
              </span>
            )}
          </Button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                <span className="text-xs text-gray-400">{NOTIFICATIONS.length} total</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {NOTIFICATIONS.map((n) => {
                  const Icon = n.icon;
                  const isRead = n.read || readIds.has(n.id);
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer",
                        !isRead && "bg-indigo-50/40"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", n.iconBg)}>
                        <Icon size={14} className={n.iconColor} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 leading-tight">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                      </div>
                      {!isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
          {initials}
        </div>
      </div>
    </header>
  );
}
