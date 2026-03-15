export type InvoiceStatus = "Draft" | "Paid" | "Partial" | "Unpaid";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;            // e.g. INV-0001
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  bookingId?: string;    // linked booking reference
  items: InvoiceItem[];
  discount: number;      // percentage 0–100
  notes?: string;
  dueDate: string;       // ISO date string
  createdAt: string;     // ISO timestamp
  status: InvoiceStatus;
  paidAmount: number;
  paidAt?: string;       // ISO timestamp
}
