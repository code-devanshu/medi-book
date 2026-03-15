"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBookings } from "@/store/bookingStore";
import { Booking } from "@/types/booking";
import { mockServices, timeSlots } from "@/data/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Stethoscope,
  FlaskConical,
  Scan,
  Activity,
  User,
  Phone,
  Mail,
  CalendarDays,
  Clock,
  IndianRupee,
  ClipboardList,
  FileText,
  Timer,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatTime } from "@/lib/utils";
import { format, parseISO } from "date-fns";

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    name:   "Doctor Consultation",
    Icon:   Stethoscope,
    pill:   "bg-indigo-50 text-indigo-700 border-indigo-200",
    card:   "border-indigo-500 bg-indigo-50/40",
    tab:    "bg-indigo-600 text-white",
    dot:    "bg-indigo-500",
  },
  {
    name:   "Pathology",
    Icon:   FlaskConical,
    pill:   "bg-violet-50 text-violet-700 border-violet-200",
    card:   "border-violet-500 bg-violet-50/40",
    tab:    "bg-violet-600 text-white",
    dot:    "bg-violet-500",
  },
  {
    name:   "Radiology",
    Icon:   Scan,
    pill:   "bg-orange-50 text-orange-700 border-orange-200",
    card:   "border-orange-500 bg-orange-50/40",
    tab:    "bg-orange-600 text-white",
    dot:    "bg-orange-500",
  },
  {
    name:   "Physiotherapy",
    Icon:   Activity,
    pill:   "bg-teal-50 text-teal-700 border-teal-200",
    card:   "border-teal-500 bg-teal-50/40",
    tab:    "bg-teal-600 text-white",
    dot:    "bg-teal-500",
  },
] as const;

function catConfig(name: string) {
  return CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[0];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AM_SLOTS = timeSlots.filter((t) => parseInt(t.split(":")[0]) < 12);
const PM_SLOTS = timeSlots.filter((t) => parseInt(t.split(":")[0]) >= 12);


function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(d: string) {
  try { return format(parseISO(d), "EEE, d MMM yyyy"); } catch { return d; }
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Patient",  Icon: User },
  { id: 2, label: "Service",  Icon: ClipboardList },
  { id: 3, label: "Schedule", Icon: CalendarDays },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => {
        const done    = current > s.id;
        const active  = current === s.id;
        return (
          <div key={s.id} className="flex items-center">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
              active ? "bg-indigo-600 text-white shadow-sm"
              : done  ? "bg-emerald-100 text-emerald-700"
              :          "bg-gray-100 text-gray-400"
            )}>
              {done
                ? <Check size={12} />
                : <s.Icon size={12} />
              }
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.id}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "h-px w-6 sm:w-10 mx-1 transition-colors",
                current > s.id ? "bg-emerald-300" : "bg-gray-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewBookingPage() {
  const router = useRouter();
  const { bookings, addBooking } = useBookings();

  const [step, setStep]           = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].name);

  const [form, setForm] = useState({
    customerName: "",
    email:        "",
    phone:        "",
    service:      "",
    date:         "",
    time:         "",
    notes:        "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const field = (name: string, value: string) =>
    setForm((p) => ({ ...p, [name]: value }));

  const selectedService = mockServices.find((s) => s.name === form.service);

  // Slots already booked on the selected date
  const bookedSlots = useMemo(() => {
    if (!form.date) return new Set<string>();
    return new Set(
      bookings
        .filter((b) => b.date === form.date && b.status !== "Cancelled")
        .map((b) => b.time)
    );
  }, [bookings, form.date]);

  // ── Per-field validation ─────────────────────────────────────────────────────

  function validateFieldValue(name: string, value: string): string {
    if (name === "customerName") {
      if (!value.trim()) return "Name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      if (value.trim().length > 100) return "Name must be at most 100 characters";
    }
    if (name === "phone") {
      if (!value.trim()) return "Phone is required";
      const stripped = value.replace(/[\s\-()]/g, "");
      if (!/^(\+91)?[6-9]\d{9}$/.test(stripped)) return "Enter a valid 10-digit mobile number";
    }
    if (name === "email") {
      if (value.trim() && !/\S+@\S+\.\S+/.test(value)) return "Enter a valid email address";
    }
    if (name === "date") {
      if (!value) return "Date is required";
      const today = new Date().toISOString().split("T")[0];
      if (value < today) return "Date cannot be in the past";
    }
    if (name === "time") {
      if (!value) return "Please pick a time slot";
    }
    return "";
  }

  function handleBlur(name: string, value: string) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateFieldValue(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  }

  function handleChange(name: string, value: string) {
    field(name, value);
    if (touched[name]) {
      const err = validateFieldValue(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  }

  // ── Step validation (used on Next / Submit click) ────────────────────────────

  function validateStep(n: number) {
    const e: Record<string, string> = {};
    if (n === 1) {
      const nameErr = validateFieldValue("customerName", form.customerName);
      if (nameErr) e.customerName = nameErr;
      const phoneErr = validateFieldValue("phone", form.phone);
      if (phoneErr) e.phone = phoneErr;
      const emailErr = validateFieldValue("email", form.email);
      if (emailErr) e.email = emailErr;
    }
    if (n === 2 && !form.service) e.service = "Please select a service";
    if (n === 3) {
      const dateErr = validateFieldValue("date", form.date);
      if (dateErr) e.date = dateErr;
      const timeErr = validateFieldValue("time", form.time);
      if (timeErr) e.time = timeErr;
    }
    return e;
  }

  function next() {
    const e = validateStep(step);
    if (step === 1) {
      setTouched((prev) => ({ ...prev, customerName: true, phone: true, email: true }));
    }
    if (step === 3) {
      setTouched((prev) => ({ ...prev, date: true, time: true }));
    }
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep((s) => s + 1);
  }

  function back() {
    setErrors({});
    setStep((s) => s - 1);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    const e = validateStep(3);
    setTouched((prev) => ({ ...prev, date: true, time: true }));
    if (Object.keys(e).length) { setErrors(e); return; }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const maxId = bookings
      .map((b) => parseInt(b.id.replace("BK-", "")) || 0)
      .reduce((a, b) => Math.max(a, b), 1000);

    const newBooking: Booking = {
      id:           `BK-${maxId + 1}`,
      customerName: form.customerName,
      email:        form.email,
      phone:        form.phone,
      service:      form.service,
      date:         form.date,
      time:         form.time,
      status:       "Pending",
      price:        selectedService?.price ?? 0,
      notes:        form.notes || undefined,
      duration:     selectedService?.duration,
    };

    addBooking(newBooking);
    setSubmitting(false);
    toast.success(`Booking ${newBooking.id} created!`, {
      description: `${form.customerName} · ${form.service}`,
    });
    router.push("/bookings");
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div data-guide="booking-form" className="max-w-5xl">
      {/* Back + heading */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-2"
          >
            <ArrowLeft size={13} /> Back to Appointments
          </button>
          <h1 className="text-xl font-semibold text-gray-900">New Appointment</h1>
          <p className="text-sm text-gray-400 mt-0.5">Book a patient in 3 quick steps</p>
        </div>
        <StepBar current={step} />
      </div>

      <div className="flex gap-5 items-start">
        {/* ── Left: step content ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* ─── Step 1: Patient ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <User size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Patient Details</p>
                  <p className="text-xs text-gray-400">Who is this appointment for?</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      value={form.customerName}
                      onChange={(e) => handleChange("customerName", e.target.value)}
                      onBlur={(e) => handleBlur("customerName", e.target.value)}
                      className={cn(
                        "pl-9 h-10 text-sm border-gray-200 focus-visible:ring-indigo-500",
                        touched.customerName && errors.customerName && "border-red-300 focus-visible:ring-red-300"
                      )}
                    />
                  </div>
                  {touched.customerName && errors.customerName && (
                    <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
                      <AlertCircle size={11} className="shrink-0" /> {errors.customerName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">
                      Phone <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      <Input
                        placeholder="+91 98200 00000"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        onBlur={(e) => handleBlur("phone", e.target.value)}
                        maxLength={10}
                        className={cn(
                          "pl-9 h-10 text-sm border-gray-200 focus-visible:ring-indigo-500",
                          touched.phone && errors.phone && "border-red-300 focus-visible:ring-red-300"
                        )}
                      />
                    </div>
                    {touched.phone && errors.phone && (
                      <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
                        <AlertCircle size={11} className="shrink-0" /> {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">
                      Email <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      <Input
                        type="email"
                        placeholder="patient@gmail.com"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        onBlur={(e) => handleBlur("email", e.target.value)}
                        className={cn(
                          "pl-9 h-10 text-sm border-gray-200 focus-visible:ring-indigo-500",
                          touched.email && errors.email && "border-red-300 focus-visible:ring-red-300"
                        )}
                      />
                    </div>
                    {touched.email && errors.email && (
                      <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
                        <AlertCircle size={11} className="shrink-0" /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={next}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                >
                  Next: Choose Service <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* ─── Step 2: Service ─────────────────────────────────────────── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <ClipboardList size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Select Service</p>
                  <p className="text-xs text-gray-400">Choose the type of appointment</p>
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ name, Icon, tab, dot }) => (
                  <button
                    key={name}
                    onClick={() => setActiveCategory(name)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      activeCategory === name
                        ? tab + " border-transparent shadow-sm"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    )}
                  >
                    <Icon size={13} />
                    {name}
                  </button>
                ))}
              </div>

              {/* Service cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockServices
                  .filter((s) => s.category === activeCategory)
                  .map((svc) => {
                    const cfg     = catConfig(svc.category);
                    const selected = form.service === svc.name;
                    return (
                      <button
                        key={svc.id}
                        onClick={() => field("service", svc.name)}
                        className={cn(
                          "text-left rounded-xl border-2 p-4 transition-all duration-150 relative group",
                          selected
                            ? cfg.card + " shadow-sm"
                            : "border-gray-100 hover:border-gray-200 hover:shadow-sm bg-white"
                        )}
                      >
                        {/* Selected checkmark */}
                        {selected && (
                          <div className={cn("absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center", cfg.dot.replace("bg-", "bg-"))}>
                            <Check size={11} className="text-white" />
                          </div>
                        )}

                        <p className={cn(
                          "text-sm font-semibold leading-snug pr-6",
                          selected ? "text-gray-900" : "text-gray-800"
                        )}>
                          {svc.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                          {svc.description}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className={cn("flex items-center gap-1 text-xs font-semibold", selected ? "text-gray-900" : "text-gray-700")}>
                            <IndianRupee size={11} />
                            {svc.price.toLocaleString("en-IN")}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Timer size={11} />
                            {svc.duration} min
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
              {errors.service && (
                <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
                  <AlertCircle size={11} className="shrink-0" /> {errors.service}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={back} className="gap-1.5 text-gray-500">
                  <ArrowLeft size={13} /> Back
                </Button>
                <Button
                  onClick={next}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                >
                  Next: Pick Date & Time <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Schedule ────────────────────────────────────────── */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <CalendarDays size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Date & Time</p>
                  <p className="text-xs text-gray-400">When should this appointment be scheduled?</p>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">
                  Appointment Date <span className="text-red-400">*</span>
                </label>
                <div className="relative max-w-xs">
                  <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => {
                      handleChange("date", e.target.value);
                      field("time", "");
                    }}
                    onBlur={(e) => handleBlur("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={cn(
                      "pl-9 h-10 text-sm border-gray-200 focus-visible:ring-indigo-500 max-w-xs",
                      touched.date && errors.date && "border-red-300 focus-visible:ring-red-300"
                    )}
                  />
                </div>
                {touched.date && errors.date && (
                  <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
                    <AlertCircle size={11} className="shrink-0" /> {errors.date}
                  </p>
                )}
              </div>

              {/* Time slot grid */}
              {form.date && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-indigo-600 inline-block" /> Available
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200 inline-block" /> Booked
                    </span>
                  </div>

                  {/* AM */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      Morning
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {AM_SLOTS.map((t) => {
                        const booked   = bookedSlots.has(t);
                        const selected = form.time === t;
                        return (
                          <button
                            key={t}
                            disabled={booked}
                            onClick={() => field("time", t)}
                            className={cn(
                              "h-9 px-3.5 rounded-lg text-xs font-medium border transition-all",
                              selected
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                : booked
                                ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                                : "bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:text-indigo-600"
                            )}
                          >
                            {formatTime(t)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PM */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      Afternoon
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PM_SLOTS.map((t) => {
                        const booked   = bookedSlots.has(t);
                        const selected = form.time === t;
                        return (
                          <button
                            key={t}
                            disabled={booked}
                            onClick={() => field("time", t)}
                            className={cn(
                              "h-9 px-3.5 rounded-lg text-xs font-medium border transition-all",
                              selected
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                : booked
                                ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                                : "bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:text-indigo-600"
                            )}
                          >
                            {formatTime(t)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {errors.time && (
                    <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
                      <AlertCircle size={11} className="shrink-0" /> {errors.time}
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Clinical Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-3 text-gray-300 pointer-events-none" />
                  <textarea
                    placeholder="Symptoms, past history, special instructions..."
                    value={form.notes}
                    onChange={(e) => field("notes", e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={back} className="gap-1.5 text-gray-500">
                  <ArrowLeft size={13} /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[160px] gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: live summary ───────────────────────────────────────── */}
        <div className="w-72 shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Booking Summary
            </p>

            {/* Patient */}
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                form.customerName ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-300"
              )}>
                {form.customerName ? initials(form.customerName) : <User size={16} />}
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold truncate", form.customerName ? "text-gray-900" : "text-gray-300")}>
                  {form.customerName || "Patient name"}
                </p>
                <p className={cn("text-xs truncate", form.phone ? "text-gray-400" : "text-gray-200")}>
                  {form.phone || "+91 —"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Service */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                  <ClipboardList size={13} className="text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Service</p>
                  {selectedService ? (
                    <>
                      <p className="text-xs font-semibold text-gray-800 leading-snug">{selectedService.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium border", catConfig(selectedService.category).pill)}>
                          {selectedService.category}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-300">Not selected</p>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                  <CalendarDays size={13} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Date & Time</p>
                  {form.date ? (
                    <p className="text-xs font-semibold text-gray-800">{formatDate(form.date)}</p>
                  ) : (
                    <p className="text-xs text-gray-300">Not selected</p>
                  )}
                  {form.time && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-indigo-600 font-semibold">
                        <Clock size={10} /> {formatTime(form.time)}
                      </span>
                      {selectedService && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Timer size={10} /> {selectedService.duration}m
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes preview */}
              {form.notes && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={13} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Notes</p>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{form.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Total */}
            {selectedService && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Consultation fee</span>
                  <span className="text-base font-bold text-gray-900">
                    ₹{selectedService.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Status will be set to Pending</p>
              </div>
            )}

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-gray-100">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    step > s.id ? "bg-emerald-400 flex-1" : step === s.id ? "bg-indigo-600 flex-1" : "bg-gray-100 flex-1"
                  )}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              Step {step} of {STEPS.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
