"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBookings } from "@/store/bookingStore";
import { useBilling } from "@/store/billingStore";
import { Invoice, InvoiceItem } from "@/types/billing";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  User,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function subtotal(items: InvoiceItem[]) {
  return items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
}


function nextInvoiceId(invoices: Invoice[]) {
  const nums = invoices
    .map((inv) => parseInt(inv.id.replace("INV-", ""), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `INV-${String(next).padStart(4, "0")}`;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { bookings } = useBookings();
  const { invoices, addInvoice } = useBilling();

  // ── Patient search ────────────────────────────────────────────────────────
  const [patientQuery, setPatientQuery] = useState("");
  const [patientName, setPatientName]   = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [linkedBookingId, setLinkedBookingId] = useState<string | undefined>();
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Unique patients derived from bookings
  const patientSuggestions = useMemo(() => {
    if (!patientQuery.trim()) return [];
    const q = patientQuery.toLowerCase();
    const seen = new Set<string>();
    return bookings
      .filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.phone.includes(q) ||
          b.email.toLowerCase().includes(q)
      )
      .filter((b) => {
        if (seen.has(b.customerName)) return false;
        seen.add(b.customerName);
        return true;
      })
      .slice(0, 6);
  }, [patientQuery, bookings]);

  const selectPatient = (name: string, email: string, phone: string) => {
    setPatientName(name);
    setPatientEmail(email);
    setPatientPhone(phone);
    setPatientQuery(name);
    setShowSuggestions(false);

    // Auto-populate items from latest booking for this patient
    const latest = bookings
      .filter((b) => b.customerName === name && b.status !== "Cancelled")
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    if (latest) {
      setLinkedBookingId(latest.id);
      setItems([
        {
          id: uid(),
          description: latest.service,
          quantity: 1,
          unitPrice: latest.price,
        },
      ]);
    }
  };

  // ── Line items ────────────────────────────────────────────────────────────
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: uid(), description: "", quantity: 1, unitPrice: 0 },
  ]);

  const addItem = () =>
    setItems((prev) => [...prev, { id: uid(), description: "", quantity: 1, unitPrice: 0 }]);

  const removeItem = (id: string) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );

  // ── Invoice meta ──────────────────────────────────────────────────────────
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [discount, setDiscount] = useState(0);
  const [dueDate, setDueDate]   = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return format(d, "yyyy-MM-dd");
  });
  const [notes, setNotes] = useState("");

  // ── Totals ────────────────────────────────────────────────────────────────
  const sub   = subtotal(items);
  const disc  = (sub * discount) / 100;
  const total = sub - disc;

  // ── Submit ────────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!patientName.trim()) {
      toast.error("Please select or enter a patient");
      return;
    }
    if (items.some((i) => !i.description.trim() || i.unitPrice <= 0)) {
      toast.error("All items need a description and price");
      return;
    }
    if (!dueDate) {
      toast.error("Please set a due date");
      return;
    }

    setSaving(true);

    const invoice: Invoice = {
      id: nextInvoiceId(invoices),
      patientName: patientName.trim(),
      patientEmail: patientEmail.trim(),
      patientPhone: patientPhone.trim(),
      bookingId: linkedBookingId,
      items,
      discount,
      notes: notes.trim() || undefined,
      dueDate,
      createdAt: new Date().toISOString(),
      status: "Unpaid",
      paidAmount: 0,
    };

    addInvoice(invoice);

    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    toast.success("Invoice created", { description: invoice.id });
    router.push(`/billing/${invoice.id}`);
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/billing"
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors"
        >
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">New Invoice</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details to generate a professional invoice</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">

        {/* ── Left: Form ────────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Patient section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User size={14} className="text-indigo-500" />
              Patient Details
            </h2>

            {/* Patient search */}
            <div className="relative">
              <Label className="text-xs text-gray-500 mb-1.5 block">Search patient</Label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  placeholder="Type name, email or phone..."
                  value={patientQuery}
                  onChange={(e) => {
                    setPatientQuery(e.target.value);
                    setShowSuggestions(true);
                    if (!e.target.value) {
                      setPatientName("");
                      setPatientEmail("");
                      setPatientPhone("");
                      setLinkedBookingId(undefined);
                      setItems([{ id: uid(), description: "", quantity: 1, unitPrice: 0 }]);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-8 h-9 text-sm border-gray-200"
                />
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && patientSuggestions.length > 0 && (
                <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {patientSuggestions.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onMouseDown={() => selectPatient(b.customerName, b.email, b.phone)}
                      className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <p className="text-sm font-medium text-gray-900">{b.customerName}</p>
                      <p className="text-xs text-gray-400">{b.phone} · {b.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Manual patient fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Full name *</Label>
                <Input
                  placeholder="Patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="h-9 text-sm border-gray-200"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Phone</Label>
                <Input
                  placeholder="+91 98200 00000"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="h-9 text-sm border-gray-200"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-gray-500 mb-1.5 block">Email</Label>
                <Input
                  placeholder="patient@email.com"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="h-9 text-sm border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText size={14} className="text-indigo-500" />
              Services &amp; Items
            </h2>

            <div className="space-y-2">
              {/* Header */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-1">
                <p className="col-span-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Description</p>
                <p className="col-span-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Qty</p>
                <p className="col-span-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-right">Unit Price</p>
                <p className="col-span-1" />
              </div>

              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-12 sm:col-span-6">
                    <Input
                      placeholder={`Service ${idx + 1}`}
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="h-9 text-sm border-gray-200"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                      className="h-9 text-sm border-gray-200 text-center"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">₹</span>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={item.unitPrice || ""}
                        onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="h-9 text-sm border-gray-200 pl-6 text-right"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="w-full border-dashed border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-300 gap-1.5"
            >
              <Plus size={13} />
              Add item
            </Button>
          </div>

          {/* Invoice settings */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Invoice Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Due Date *</Label>
                <Input
                  type="date"
                  value={dueDate}
                  min={todayStr}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 text-sm border-gray-200"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Discount (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="h-9 text-sm border-gray-200"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-gray-500 mb-1.5 block">Notes (optional)</Label>
                <textarea
                  placeholder="Any additional notes for this invoice..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Live preview ────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Preview</h2>

            {/* Patient */}
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Bill To</p>
              <p className="text-sm font-medium text-gray-900">
                {patientName || <span className="text-gray-300">Patient name</span>}
              </p>
              {patientPhone && <p className="text-xs text-gray-400">{patientPhone}</p>}
              {patientEmail && <p className="text-xs text-gray-400">{patientEmail}</p>}
            </div>

            <div className="border-t border-gray-50 pt-3">
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-2">
                <span>Item</span>
                <span>Amount</span>
              </div>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2">
                    <span className="text-xs text-gray-600 flex-1 truncate">
                      {item.description || <span className="text-gray-300">—</span>}
                      {item.quantity > 1 && (
                        <span className="text-gray-400"> ×{item.quantity}</span>
                      )}
                    </span>
                    <span className="text-xs font-medium text-gray-900 shrink-0">
                      ₹{(item.quantity * item.unitPrice).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 pt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span>₹{sub.toLocaleString("en-IN")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Discount ({discount}%)</span>
                  <span>−₹{disc.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {dueDate && (
              <p className="text-xs text-gray-400">
                Due: {format(new Date(dueDate), "d MMM yyyy")}
              </p>
            )}

            <Button
              onClick={handleGenerate}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 mt-2"
            >
              {saving ? "Generating..." : "Generate Invoice"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
