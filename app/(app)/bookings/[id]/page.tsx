"use client";

import { use, useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";
import { useBookings } from "@/store/bookingStore";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Edit,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookingStatus } from "@/types/booking";
import { timeSlots } from "@/data/services";
import { format } from "date-fns";

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { bookings, cancelBooking, updateBooking } = useBookings();
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const booking = bookings.find((b) => b.id === id);

  const openEdit = () => {
    if (!booking) return;
    setEditDate(booking.date);
    setEditTime(booking.time);
    setEditNotes(booking.notes ?? "");
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editDate || !editTime) {
      toast.error("Date and time are required");
      return;
    }
    if (editDate < format(new Date(), "yyyy-MM-dd")) {
      toast.error("Cannot reschedule to a past date");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    updateBooking(id, { date: editDate, time: editTime, notes: editNotes });
    setSaving(false);
    setEditOpen(false);
    toast.success("Booking updated!", { description: `Rescheduled to ${formatTime(editTime)} on ${editDate}` });
  };

  const handleCancel = async () => {
    setCancelling(true);
    await new Promise((r) => setTimeout(r, 700));
    cancelBooking(id);
    setCancelling(false);
    setCancelDialog(false);
    toast.success("Booking cancelled");
  };

  const handleConfirm = async () => {
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 600));
    updateBooking(id, { status: "Confirmed" });
    setConfirming(false);
    toast.success("Booking confirmed!");
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Booking not found.</p>
        <Link href="/bookings">
          <Button variant="outline" size="sm" className="mt-4">
            Back to Bookings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl space-y-5">
        {/* Back */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-900 font-medium">{booking.id}</span>
        </div>

        {/* Header card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-semibold text-gray-900">
                  {booking.customerName}
                </h1>
                <StatusBadge status={booking.status as BookingStatus} />
              </div>
              <p className="text-sm text-gray-500">{booking.id}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {booking.status === "Pending" && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs gap-1.5"
                  onClick={handleConfirm}
                  disabled={confirming}
                >
                  <CheckCircle size={13} />
                  {confirming ? "Confirming..." : "Mark Confirmed"}
                </Button>
              )}
              {booking.status !== "Cancelled" && booking.status !== "Completed" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5"
                    onClick={openEdit}
                  >
                    <Edit size={13} /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setCancelDialog(true)}
                  >
                    <XCircle size={13} /> Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Customer Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow
              icon={<Mail size={14} className="text-gray-400" />}
              label="Email"
              value={booking.email}
            />
            <InfoRow
              icon={<Phone size={14} className="text-gray-400" />}
              label="Phone"
              value={booking.phone}
            />
          </div>
        </div>

        {/* Booking info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Booking Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow
              icon={<FileText size={14} className="text-gray-400" />}
              label="Service"
              value={booking.service}
            />
            <InfoRow
              icon={<DollarSign size={14} className="text-gray-400" />}
              label="Fee (₹)"
              value={`₹${booking.price.toLocaleString("en-IN")}`}
            />
            <InfoRow
              icon={<Calendar size={14} className="text-gray-400" />}
              label="Date"
              value={booking.date}
            />
            <InfoRow
              icon={<Clock size={14} className="text-gray-400" />}
              label="Time"
              value={formatTime(booking.time)}
            />
            {booking.duration && (
              <InfoRow
                icon={<Clock size={14} className="text-gray-400" />}
                label="Duration"
                value={`${booking.duration} min`}
              />
            )}
          </div>
          {booking.notes && (
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{booking.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Cancel booking {booking.id} for {booking.customerName}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelDialog(false)}
              disabled={cancelling}
            >
              Keep
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Reschedule or update notes for {booking.customerName}&apos;s appointment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Date */}
            <div>
              <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Date</Label>
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="h-9 text-sm border-gray-200"
              />
            </div>

            {/* Time slots */}
            <div>
              <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Time Slot</Label>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditTime(t)}
                    className={`h-8 px-3 rounded-lg text-xs font-medium border transition-all ${
                      editTime === t
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:text-indigo-600"
                    }`}
                  >
                    {formatTime(t)}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Notes</Label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                placeholder="Any special instructions..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
              onClick={handleSaveEdit}
              disabled={saving}
            >
              <Save size={13} />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
      </div>
    </div>
  );
}
