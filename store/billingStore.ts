"use client";

import { createContext, useContext } from "react";
import { Invoice } from "@/types/billing";

export interface BillingStore {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  markAsPaid: (id: string, amount: number) => void;
  markAsPartial: (id: string, amount: number) => void;
}

export const BillingContext = createContext<BillingStore>({
  invoices: [],
  addInvoice: () => {},
  updateInvoice: () => {},
  deleteInvoice: () => {},
  markAsPaid: () => {},
  markAsPartial: () => {},
});

export const useBilling = () => useContext(BillingContext);
