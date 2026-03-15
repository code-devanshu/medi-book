import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BookingProvider } from "@/components/providers/BookingProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DemoGuideProvider } from "@/components/providers/DemoGuideProvider";
import { BillingProvider } from "@/components/providers/BillingProvider";
import { DemoGuide } from "@/components/guide/DemoGuide";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediBook — Clinic & Appointment Management",
  description: "Modern SaaS clinic appointment management for India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased font-sans`}>
        <AuthProvider>
          <DemoGuideProvider>
            <BookingProvider>
              <BillingProvider>
                {children}
                <DemoGuide />
                <Toaster richColors position="top-right" />
              </BillingProvider>
            </BookingProvider>
          </DemoGuideProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
