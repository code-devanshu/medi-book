"use client";

import { useState, useMemo } from "react";
import { useBilling } from "@/store/billingStore";
import { Invoice, InvoiceStatus } from "@/types/billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, parseISO, isPast } from "date-fns";
import { useEffect } from "react";

type FilterTab = "all" | "unpaid" | "partial" | "paid" | "draft";

const STATUS_BADGE: Record<InvoiceStatus, string> = {
  Paid:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Unpaid:  "bg-red-50 text-red-600 border-red-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
  Draft:   "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_DOT: Record<InvoiceStatus, string> = {
  Paid:    "bg-emerald-500",
  Unpaid:  "bg-red-400",
  Partial: "bg-amber-400",
  Draft:   "bg-gray-400",
};

function subtotal(inv: Invoice) {
  return inv.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
}

function total(inv: Invoice) {
  const sub = subtotal(inv);
  return sub - (sub * inv.discount) / 100;
}

function isOverdue(inv: Invoice) {
  if (inv.status === "Paid") return false;
  return isPast(parseISO(inv.dueDate + "T23:59:59"));
}

export default function BillingPage() {
  const { invoices, deleteInvoice } = useBilling();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalInvoiced = invoices.reduce((s, inv) => s + total(inv), 0);
  const collected     = invoices.reduce((s, inv) => s + inv.paidAmount, 0);
  const outstanding   = totalInvoiced - collected;
  const overdueCount  = invoices.filter(isOverdue).length;
  const paidCount     = invoices.filter((inv) => inv.status === "Paid").length;
  const unpaidCount   = invoices.filter((inv) => inv.status === "Unpaid").length;
  const partialCount  = invoices.filter((inv) => inv.status === "Partial").length;
  const draftCount    = invoices.filter((inv) => inv.status === "Draft").length;

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...invoices];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (inv) =>
          inv.patientName.toLowerCase().includes(q) ||
          inv.id.toLowerCase().includes(q) ||
          inv.patientPhone.includes(q)
      );
    }

    switch (filter) {
      case "unpaid":  list = list.filter((inv) => inv.status === "Unpaid"); break;
      case "partial": list = list.filter((inv) => inv.status === "Partial"); break;
      case "paid":    list = list.filter((inv) => inv.status === "Paid"); break;
      case "draft":   list = list.filter((inv) => inv.status === "Draft"); break;
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invoices, search, filter]);

  const handleDelete = (inv: Invoice) => {
    deleteInvoice(inv.id);
    toast.success("Invoice deleted", { description: `${inv.id} removed` });
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-24 mb-1" />
            <Skeleton className="h-4 w-52" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
    );
  }

  const TABS: { id: FilterTab; label: string; count: number }[] = [
    { id: "all",     label: "All",     count: invoices.length },
    { id: "unpaid",  label: "Unpaid",  count: unpaidCount },
    { id: "partial", label: "Partial", count: partialCount },
    { id: "paid",    label: "Paid",    count: paidCount },
    { id: "draft",   label: "Draft",   count: draftCount },
  ];

  return (
    <div className="space-y-5" data-guide="billing-list">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Billing</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Generate and manage patient invoices
          </p>
        </div>
        <Button
          onClick={() => router.push("/billing/new")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shrink-0"
          size="sm"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Invoiced"
          value={`₹${totalInvoiced.toLocaleString("en-IN")}`}
          icon={<IndianRupee size={15} className="text-indigo-600" />}
          bg="bg-indigo-50"
          sub={`${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
        />
        <SummaryCard
          label="Collected"
          value={`₹${collected.toLocaleString("en-IN")}`}
          icon={<CheckCircle2 size={15} className="text-emerald-600" />}
          bg="bg-emerald-50"
          sub={`${paidCount} paid`}
          positive
        />
        <SummaryCard
          label="Outstanding"
          value={`₹${outstanding.toLocaleString("en-IN")}`}
          icon={<Clock size={15} className="text-amber-600" />}
          bg="bg-amber-50"
          sub={`${unpaidCount + partialCount} pending`}
        />
        <SummaryCard
          label="Overdue"
          value={String(overdueCount)}
          icon={<AlertTriangle size={15} className="text-rose-600" />}
          bg="bg-rose-50"
          sub={overdueCount > 0 ? "Needs attention" : "All on time"}
          alert={overdueCount > 0}
        />
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0",
                filter === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none",
                  filter === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search name, ID, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm bg-white border-gray-200"
          />
        </div>
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden -mt-2">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              <FileText size={20} className="text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {invoices.length === 0 ? "No invoices yet" : "No invoices match this filter"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {invoices.length === 0
                  ? "Create your first invoice to get started"
                  : "Try a different tab or clear the search"}
              </p>
            </div>
            {invoices.length === 0 && (
              <Button
                onClick={() => router.push("/billing/new")}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 mt-1"
              >
                <Plus size={13} />
                Create Invoice
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((inv) => {
              const tot      = total(inv);
              const remaining = tot - inv.paidAmount;
              const overdue  = isOverdue(inv);
              return (
                <div
                  key={inv.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/60 transition-colors",
                    overdue && inv.status !== "Paid" && "bg-rose-50/30 hover:bg-rose-50/50"
                  )}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold shrink-0">
                    {inv.patientName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm">{inv.patientName}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{inv.id}</span>
                      {overdue && inv.status !== "Paid" && (
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded-full">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {inv.items.length} item{inv.items.length !== 1 ? "s" : ""} · Due {format(parseISO(inv.dueDate), "d MMM yyyy")}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="hidden sm:block text-right shrink-0 min-w-[80px]">
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{tot.toLocaleString("en-IN")}
                    </p>
                    {inv.status === "Partial" && (
                      <p className="text-xs text-amber-600">₹{remaining.toLocaleString("en-IN")} due</p>
                    )}
                    {inv.status === "Paid" && inv.paidAt && (
                      <p className="text-xs text-emerald-600">{format(new Date(inv.paidAt), "d MMM")}</p>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="shrink-0">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border",
                        STATUS_BADGE[inv.status]
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", STATUS_DOT[inv.status])} />
                      <span className="hidden sm:inline">{inv.status}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <MoreHorizontal size={14} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-sm">
                        <DropdownMenuItem onClick={() => router.push(`/billing/${inv.id}`)}>
                          <Eye size={13} className="mr-2 text-indigo-500" />
                          View Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => handleDelete(inv)}
                        >
                          <Trash2 size={13} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label, value, icon, bg, sub, positive, alert,
}: {
  label: string; value: string; icon: React.ReactNode;
  bg: string; sub: string; positive?: boolean; alert?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-500 leading-snug">{label}</p>
        <div className={cn("p-1.5 rounded-lg shrink-0", bg)}>{icon}</div>
      </div>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
      <p className={cn(
        "text-xs mt-0.5 font-medium",
        alert ? "text-rose-500" : positive ? "text-emerald-600" : "text-gray-400"
      )}>
        {sub}
      </p>
    </div>
  );
}
