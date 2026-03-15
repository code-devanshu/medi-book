"use client";

import { useState, ReactNode } from "react";
import { BillingContext } from "@/store/billingStore";
import { Invoice } from "@/types/billing";

const BILLING_KEY = "medibook_billing_v2";

export function BillingProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(BILLING_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const save = (updated: Invoice[]) => {
    setInvoices(updated);
    try {
      localStorage.setItem(BILLING_KEY, JSON.stringify(updated));
    } catch {}
  };

  const addInvoice = (invoice: Invoice) => {
    save([invoice, ...invoices]);
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    save(invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)));
  };

  const deleteInvoice = (id: string) => {
    save(invoices.filter((inv) => inv.id !== id));
  };

  const markAsPaid = (id: string, amount: number) => {
    updateInvoice(id, {
      status: "Paid",
      paidAmount: amount,
      paidAt: new Date().toISOString(),
    });
  };

  const markAsPartial = (id: string, amount: number) => {
    updateInvoice(id, { status: "Partial", paidAmount: amount });
  };

  return (
    <BillingContext.Provider value={{ invoices, addInvoice, updateInvoice, deleteInvoice, markAsPaid, markAsPartial }}>
      {children}
    </BillingContext.Provider>
  );
}
