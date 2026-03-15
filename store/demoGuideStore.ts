"use client";

import { createContext, useContext } from "react";

export interface GuideStep {
  id: number;
  title: string;
  description: string;
  path: string;
  target: string;          // data-guide attribute value
  actionLabel: string;     // what the user should do
  position: "top" | "bottom" | "left" | "right" | "center";
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: 1,
    title: "Welcome to MediBook! 👋",
    description:
      "MediBook is a clinic appointment management system for doctors, pathology labs, and physiotherapy centres. Use the demo credentials below to sign in and explore the full app.",
    path: "/login",
    target: "login-form",
    actionLabel: "Sign in using any demo credential below",
    position: "right",
  },
  {
    id: 2,
    title: "Clinic Dashboard",
    description:
      "After login you land here. All key metrics — total appointments, today's count, confirmed, cancelled, and total revenue — are shown at a glance.",
    path: "/dashboard",
    target: "dashboard-stats",
    actionLabel: "Review the stats cards above",
    position: "bottom",
  },
  {
    id: 3,
    title: "Live Charts",
    description:
      "Track daily booking trends, status distribution across Confirmed / Pending / Cancelled, and weekly revenue vs target — all updating with your real data.",
    path: "/dashboard",
    target: "dashboard-charts",
    actionLabel: "Scroll down to see the charts",
    position: "top",
  },
  {
    id: 4,
    title: "Appointments List",
    description:
      "Every appointment is listed here with full details. You can search by patient name or booking ID, filter by status, and sort by date.",
    path: "/bookings",
    target: "appointments-table",
    actionLabel: "Try searching for a patient name",
    position: "bottom",
  },
  {
    id: 5,
    title: "Create a New Appointment",
    description:
      "Book an appointment for any patient — pick their service (General Physician, Pathology, Physiotherapy, etc.), date, and time slot. The booking is added instantly.",
    path: "/bookings/new",
    target: "booking-form",
    actionLabel: "Fill in the form and create a booking",
    position: "right",
  },
  {
    id: 6,
    title: "Calendar View",
    description:
      "See all appointments plotted on a monthly calendar. Click any day to expand the list of bookings for that day with status colour codes.",
    path: "/calendar",
    target: "calendar-grid",
    actionLabel: "Click on any date that has bookings",
    position: "bottom",
  },
  {
    id: 7,
    title: "Patient Records",
    description:
      "All registered patients are listed with their contact details, total visits, and total spend. Click a patient row to view their full appointment history.",
    path: "/customers",
    target: "patients-table",
    actionLabel: "Click on any patient to view their profile",
    position: "bottom",
  },
  {
    id: 8,
    title: "Analytics & Insights",
    description:
      "Track clinic performance — daily booking trends, weekly revenue growth, service popularity by department, and the cancellation rate over the last 6 months.",
    path: "/analytics",
    target: "analytics-charts",
    actionLabel: "Explore the charts and revenue table",
    position: "top",
  },
  {
    id: 9,
    title: "Clinic Settings",
    description:
      "Configure your clinic name, operating hours, timezone (IST), currency (₹), and notification preferences for confirmation emails and SMS reminders.",
    path: "/settings",
    target: "settings-form",
    actionLabel: "Update your clinic name and save",
    position: "bottom",
  },
];

export interface DemoGuideStore {
  isOpen: boolean;
  currentStep: number;
  completedSteps: number[];
  startGuide: () => void;
  dismissGuide: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  markStepComplete: (step: number) => void;
}

export const DemoGuideContext = createContext<DemoGuideStore>({
  isOpen: false,
  currentStep: 1,
  completedSteps: [],
  startGuide: () => {},
  dismissGuide: () => {},
  nextStep: () => {},
  prevStep: () => {},
  goToStep: () => {},
  markStepComplete: () => {},
});

export const useDemoGuide = () => useContext(DemoGuideContext);
