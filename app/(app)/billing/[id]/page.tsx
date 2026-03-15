"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBilling } from "@/store/billingStore";
import { Invoice, InvoiceItem } from "@/types/billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Printer,
  CheckCircle2,
  Trash2,
  TrendingUp,
  Stethoscope,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, parseISO, isPast } from "date-fns";

const BILLING_KEY  = "medibook_billing_v2";
const SETTINGS_KEY = "medibook_settings";

const DEFAULT_CLINIC = {
  businessName:  "MediBook Multispeciality Clinic",
  businessEmail: "appointments@medibook.in",
  businessPhone: "+91 98200 12345",
};

function subtotal(items: InvoiceItem[]) {
  return items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
}

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const { markAsPaid, markAsPartial, deleteInvoice } = useBilling();

  const [loading, setLoading]   = useState(true);
  const [invoice, setInvoice]   = useState<Invoice | null>(null);
  const [clinic, setClinic]     = useState(DEFAULT_CLINIC);
  const { invoices } = useBilling();

  // Load invoice directly from localStorage on mount – guaranteed to have the
  // freshly-created invoice regardless of context timing.
  useEffect(() => {
    let found: Invoice | null = null;
    try {
      const raw = localStorage.getItem(BILLING_KEY);
      if (raw) {
        const all: Invoice[] = JSON.parse(raw);
        found = all.find((inv) => inv.id === id) ?? null;
      }
    } catch {}
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setClinic({ ...DEFAULT_CLINIC, ...JSON.parse(raw) });
    } catch {}
    setInvoice(found);
    setLoading(false);
  }, [id]);

  // Keep local invoice in sync when context mutations happen (mark paid, etc.)
  useEffect(() => {
    if (loading) return;
    const fromContext = invoices.find((inv) => inv.id === id);
    if (fromContext) setInvoice(fromContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices]);

  const [partialOpen, setPartialOpen]     = useState(false);
  const [partialAmount, setPartialAmount] = useState("");
  const [saving, setSaving]               = useState(false);
  const [deleteOpen, setDeleteOpen]       = useState(false);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3.5 w-40" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <AlertTriangle size={22} className="text-gray-300" />
        </div>
        <p className="text-sm text-gray-500">Invoice not found</p>
        <Link href="/billing">
          <Button variant="outline" size="sm">Back to Billing</Button>
        </Link>
      </div>
    );
  }

  // ── Computed values ───────────────────────────────────────────────────────
  const sub       = subtotal(invoice.items);
  const disc      = (sub * invoice.discount) / 100;
  const total     = sub - disc;
  const balance   = total - invoice.paidAmount;
  const isOverdue = invoice.status !== "Paid" && isPast(parseISO(invoice.dueDate + "T23:59:59"));


  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleMarkPaid = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    markAsPaid(invoice.id, total);
    setSaving(false);
    toast.success("Marked as paid", { description: `₹${total.toLocaleString("en-IN")} received` });
  };

  const handlePartialSubmit = async () => {
    const amt = parseFloat(partialAmount);
    if (isNaN(amt) || amt <= 0 || amt >= total) {
      toast.error("Enter an amount between ₹1 and ₹" + (total - 1).toLocaleString("en-IN"));
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    markAsPartial(invoice.id, amt);
    setSaving(false);
    setPartialOpen(false);
    setPartialAmount("");
    toast.success("Partial payment recorded");
  };

  const handleDelete = () => {
    deleteInvoice(invoice.id);
    toast.success("Invoice deleted");
    router.push("/billing");
  };

  return (
    <>
      {/* Action bar — hidden when printing */}
      <div className="print:hidden mb-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/billing"
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{invoice.id}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Created {format(new Date(invoice.createdAt), "d MMM yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {invoice.status !== "Paid" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setPartialAmount(""); setPartialOpen(true); }}
                className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <TrendingUp size={13} />
                <span className="hidden sm:inline">Partial</span>
              </Button>
              <Button
                size="sm"
                onClick={handleMarkPaid}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <CheckCircle2 size={13} />
                <span className="hidden sm:inline">{saving ? "Saving..." : "Mark as Paid"}</span>
                <span className="sm:hidden">{saving ? "..." : "Paid"}</span>
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer size={13} />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      {/* ── Invoice document ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-10 max-w-2xl mx-auto relative overflow-hidden print:max-w-none print:shadow-none print:border-0 print:rounded-none print:p-10 print:overflow-visible">

        {/* Screen-only status banner */}
        {(isOverdue || invoice.status === "Paid") && (
          <div
            className={cn(
              "print:hidden mb-6 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2",
              isOverdue
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            )}
          >
            {isOverdue ? (
              <><AlertTriangle size={14} /> This invoice is overdue</>
            ) : (
              <><CheckCircle2 size={14} /> Payment received{invoice.paidAt ? ` · ${format(new Date(invoice.paidAt), "d MMM yyyy")}` : ""}</>
            )}
          </div>
        )}

        {/* Clinic header */}
        <div className="flex items-start justify-between mb-8" style={{ position: "relative", zIndex: 1 }}>
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                <Stethoscope size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">{clinic.businessName}</span>
            </div>
            <p className="text-xs text-gray-500 ml-0.5">{clinic.businessEmail}</p>
            <p className="text-xs text-gray-500 ml-0.5">{clinic.businessPhone}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Invoice</p>
            <p className="text-2xl font-bold text-gray-900">{invoice.id}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-7" style={{ position: "relative", zIndex: 1 }} />

        {/* Bill to / Invoice info */}
        <div className="grid grid-cols-2 gap-6 mb-8" style={{ position: "relative", zIndex: 1 }}>
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
            <p className="text-sm font-semibold text-gray-900">{invoice.patientName}</p>
            {invoice.patientPhone && <p className="text-xs text-gray-500 mt-1">{invoice.patientPhone}</p>}
            {invoice.patientEmail && <p className="text-xs text-gray-500">{invoice.patientEmail}</p>}
            {invoice.bookingId && (
              <p className="text-xs text-gray-400 mt-1.5 font-mono">Ref: {invoice.bookingId}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Invoice Details</p>
            <table className="ml-auto text-xs">
              <tbody>
                <tr>
                  <td className="text-gray-400 pr-6 pb-1">Invoice Date</td>
                  <td className="text-gray-700 font-medium text-right">{format(new Date(invoice.createdAt), "d MMM yyyy")}</td>
                </tr>
                <tr>
                  <td className="text-gray-400 pr-6 pb-1">Due Date</td>
                  <td className={cn("font-medium text-right", isOverdue ? "text-rose-600" : "text-gray-700")}>
                    {format(parseISO(invoice.dueDate), "d MMM yyyy")}
                  </td>
                </tr>
                {invoice.paidAt && (
                  <tr>
                    <td className="text-gray-400 pr-6">Paid On</td>
                    <td className="text-emerald-600 font-medium text-right">
                      {format(new Date(invoice.paidAt), "d MMM yyyy")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Line items table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-7" style={{ position: "relative", zIndex: 1 }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest w-1/2">
                  Description
                </th>
                <th className="text-center px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Qty
                </th>
                <th className="text-right px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Unit Price
                </th>
                <th className="text-right px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoice.items.map((item) => (
                <tr key={item.id} className="print-no-break hover:bg-gray-50/40">
                  <td className="px-4 py-3.5 text-gray-800 font-medium">{item.description}</td>
                  <td className="px-4 py-3.5 text-center text-gray-500">{item.quantity}</td>
                  <td className="px-4 py-3.5 text-right text-gray-500">
                    ₹{item.unitPrice.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-gray-900">
                    ₹{(item.quantity * item.unitPrice).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-7" style={{ position: "relative", zIndex: 1 }}>
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₹{sub.toLocaleString("en-IN")}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount ({invoice.discount}%)</span>
                <span>−₹{disc.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 border-t-2 border-gray-200 pt-2.5 mt-1">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            {invoice.paidAmount > 0 && (
              <>
                <div className="flex justify-between text-sm text-emerald-600 pt-1">
                  <span>Amount Paid</span>
                  <span>₹{invoice.paidAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2 mt-1"
                  style={{ color: balance === 0 ? "#059669" : "#e11d48" }}>
                  <span>{balance === 0 ? "Fully Paid" : "Balance Due"}</span>
                  <span>₹{balance.toLocaleString("en-IN")}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="border-t border-gray-100 pt-5 mb-6" style={{ position: "relative", zIndex: 1 }}>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</p>
            <p className="text-sm text-gray-600 leading-relaxed">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-5" style={{ position: "relative", zIndex: 1 }}>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Thank you for choosing {clinic.businessName}.<br />
            For billing queries, contact us at {clinic.businessEmail} · {clinic.businessPhone}
          </p>
        </div>
      </div>

      {/* Partial payment dialog */}
      <Dialog open={partialOpen} onOpenChange={setPartialOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Record Partial Payment</DialogTitle>
            <DialogDescription>
              How much did {invoice.patientName} pay? Total: ₹{total.toLocaleString("en-IN")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">₹</span>
              <Input
                type="number"
                placeholder="Amount received"
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                className="pl-7 h-10 text-sm border-gray-200"
                min={1}
                max={total - 1}
              />
            </div>
            {partialAmount && parseFloat(partialAmount) > 0 && parseFloat(partialAmount) < total && (
              <p className="text-xs text-amber-600 mt-1.5">
                ₹{(total - parseFloat(partialAmount)).toLocaleString("en-IN")} will remain outstanding
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setPartialOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handlePartialSubmit}
              disabled={saving || !partialAmount || parseFloat(partialAmount) <= 0}
            >
              {saving ? "Saving..." : "Save Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              This will permanently remove {invoice.id}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button size="sm" variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
