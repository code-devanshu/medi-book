"use client";

import { useState, useEffect, useMemo } from "react";
import { DEMO_SLOTS, TOTAL_DEMO_SLOTS } from "@/lib/demoAccounts";
import {
  Copy, Check, Lock, ShieldCheck, ChevronDown, ChevronUp,
  Stethoscope, Users, CheckCircle2, Inbox, Phone, MapPin,
  CalendarDays, StickyNote, User, Building2, MessageSquareMore,
  MessageCircle, Globe, Linkedin,
} from "lucide-react";

const ADMIN_PASSWORD = "medibook-admin-2026";
const STORAGE_KEY = "medibook_admin_slots";

interface SlotRecord {
  slot: number;
  assignedTo: string;
  phone: string;
  clinic: string;
  address: string;
  dateSent: string;
  notes: string;
  assigned: boolean;
}

const defaultRecords = (): SlotRecord[] =>
  DEMO_SLOTS.map((s) => ({
    slot: s.slot,
    assignedTo: "",
    phone: "",
    clinic: "",
    address: "",
    dateSent: "",
    notes: "",
    assigned: false,
  }));

export default function AdminPage() {
  const [isLocalhost, setIsLocalhost] = useState<boolean | null>(null);
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [records, setRecords] = useState<SlotRecord[]>(defaultRecords());
  const [expandedSlot, setExpandedSlot] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<SlotRecord>>({});
  const [editErrors, setEditErrors] = useState<{ assignedTo?: string; phone?: string }>({});

  useEffect(() => {
    const host = window.location.hostname;
    setIsLocalhost(host === "localhost" || host === "127.0.0.1");
    if (sessionStorage.getItem("medibook_admin_authed") === "true") {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: SlotRecord[] = JSON.parse(raw);
        setRecords(defaultRecords().map((d) => saved.find((s) => s.slot === d.slot) ?? d));
      }
    } catch {}
  }, [authed]);

  const saveRecords = (updated: SlotRecord[]) => {
    setRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem("medibook_admin_authed", "true");
      setAuthed(true);
      setPasswordError(false);
    } else setPasswordError(true);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copySlotCredentials = (slot: (typeof DEMO_SLOTS)[0]) => {
    const text = `🔑 Your MediBook Demo Access\n\n👨‍⚕️ Doctor Login (full access):\n  Email:    ${slot.doctor.email}\n  Password: ${slot.doctor.password}\n\n🗂️ Reception Login (for your staff):\n  Email:    ${slot.office.email}\n  Password: ${slot.office.password}\n\n👉 https://medi-book-theta.vercel.app/`;
    copyText(text, `slot-${slot.slot}`);
  };

  const startEdit = (record: SlotRecord) => {
    setEditingSlot(record.slot);
    setEditDraft({ ...record });
    setEditErrors({});
  };

  const saveEdit = () => {
    if (editingSlot === null) return;
    const errs: { assignedTo?: string; phone?: string } = {};
    if (!editDraft.assignedTo?.trim()) errs.assignedTo = "Name is required";
    if (!editDraft.phone?.trim()) errs.phone = "Phone is required";
    else if (!/^\d{10}$/.test(editDraft.phone.trim())) errs.phone = "Enter a valid 10-digit number";
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    const updated = records.map((r) =>
      r.slot === editingSlot ? { ...r, ...editDraft, assigned: true } : r
    );
    saveRecords(updated);
    setEditingSlot(null);
    setEditDraft({});
    setEditErrors({});
  };

  const toggleAssigned = (slot: number) => {
    saveRecords(records.map((r) => r.slot === slot ? { ...r, assigned: !r.assigned } : r));
  };

  const stats = useMemo(() => {
    const assigned = records.filter((r) => r.assigned).length;
    return { assigned, remaining: TOTAL_DEMO_SLOTS - assigned };
  }, [records]);

  // ── Localhost blocked ──────────────────────────────────────────────
  if (isLocalhost === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
            <Lock size={26} className="text-red-500" />
          </div>
          <div>
            <p className="text-gray-900 font-semibold text-lg">Access Denied</p>
            <p className="text-gray-500 text-sm mt-1">This page is restricted and not publicly accessible.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLocalhost === null) return null;

  // ── Password gate ──────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
                <Stethoscope size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 leading-tight">MediBook Admin</p>
                <p className="text-gray-400 text-xs mt-0.5">Local access only</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Admin Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                    placeholder="Enter admin password"
                    autoFocus
                    className={`w-full bg-white border rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition-all ${
                      passwordError
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-indigo-100 focus:border-indigo-400"
                    }`}
                  />
                </div>
                {passwordError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500 inline-block" /> Incorrect password.
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <ShieldCheck size={15} /> Enter Admin Panel
              </button>
            </form>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">© 2026 MediBook India · Restricted access</p>
        </div>
      </div>
    );
  }

  // ── Admin dashboard ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Stethoscope size={15} className="text-white" />
            </div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900 text-sm">MediBook</p>
              <span className="text-gray-300 text-sm">·</span>
              <p className="text-gray-500 text-sm">Admin Panel</p>
            </div>
          </div>
          <span className="text-[11px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full font-medium">
            Restricted
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={Users} label="Total Slots" value={TOTAL_DEMO_SLOTS} iconClass="text-gray-500" bgClass="bg-gray-100" valueClass="text-gray-900" />
          <StatCard icon={CheckCircle2} label="Assigned" value={stats.assigned} iconClass="text-emerald-600" bgClass="bg-emerald-50" valueClass="text-emerald-700" />
          <StatCard icon={Inbox} label="Available" value={stats.remaining} iconClass="text-indigo-600" bgClass="bg-indigo-50" valueClass="text-indigo-700" />
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Campaign Progress</p>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{stats.assigned}</span> of {TOTAL_DEMO_SLOTS} slots assigned
            </p>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(stats.assigned / TOTAL_DEMO_SLOTS) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{stats.remaining} slots remaining to distribute</p>
        </div>

        {/* Slots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-gray-700">Demo Slots</p>
            <p className="text-xs text-gray-400">{TOTAL_DEMO_SLOTS} total · click a row to expand</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {DEMO_SLOTS.map((slot) => {
              const record = records.find((r) => r.slot === slot.slot)!;
              const isExpanded = expandedSlot === slot.slot;
              const isEditing = editingSlot === slot.slot;
              const wasCopied = copiedKey === `slot-${slot.slot}`;

              return (
                <div key={slot.slot} className={isExpanded ? "bg-gray-50/70" : ""}>
                  {/* Row */}
                  <div
                    className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50/80 transition-colors"
                    onClick={() => setExpandedSlot(isExpanded ? null : slot.slot)}
                  >
                    {/* Slot badge */}
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      record.assigned ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {slot.slot}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {record.assignedTo ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">{record.assignedTo}</p>
                          {record.clinic && <span className="text-xs text-gray-400">{record.clinic}</span>}
                          {record.phone && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Phone size={10} /> {record.phone}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Unassigned</p>
                      )}
                      {record.dateSent && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <CalendarDays size={10} /> Sent {record.dateSent}
                        </p>
                      )}
                    </div>

                    {/* Status toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleAssigned(slot.slot); }}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
                        record.assigned
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                      }`}
                    >
                      {record.assigned ? "Assigned" : "Available"}
                    </button>

                    {/* Copy WhatsApp msg */}
                    <button
                      onClick={(e) => { e.stopPropagation(); copySlotCredentials(slot); }}
                      title="Copy WhatsApp message"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        wasCopied
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-gray-50 text-gray-400 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                      }`}
                    >
                      {wasCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>

                    {/* Expand */}
                    <span className="text-gray-300 shrink-0">
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </span>
                  </div>

                  {/* Expanded panel */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-gray-100">

                      {/* Credentials */}
                      <div className="grid grid-cols-2 gap-3 pt-4">
                        <CredCard
                          title="Doctor Login"
                          accent="indigo"
                          email={slot.doctor.email}
                          password={slot.doctor.password}
                          onCopy={copyText}
                          copiedKey={copiedKey}
                        />
                        <CredCard
                          title="Reception Login"
                          accent="teal"
                          email={slot.office.email}
                          password={slot.office.password}
                          onCopy={copyText}
                          copiedKey={copiedKey}
                        />
                      </div>

                      {/* Assignee details */}
                      {isEditing ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                          <p className="text-xs font-semibold text-gray-700">Assign to Doctor</p>
                          <div className="grid grid-cols-2 gap-3">
                            <Field
                              icon={User}
                              label="Doctor Name *"
                              value={editDraft.assignedTo ?? ""}
                              onChange={(v) => { setEditDraft((d) => ({ ...d, assignedTo: v })); setEditErrors((e) => ({ ...e, assignedTo: "" })); }}
                              placeholder="Dr. Ravi Mehta"
                              error={editErrors.assignedTo}
                            />
                            <Field
                              icon={Phone}
                              label="Phone Number *"
                              value={editDraft.phone ?? ""}
                              onChange={(v) => { setEditDraft((d) => ({ ...d, phone: v.replace(/\D/g, "").slice(0, 10) })); setEditErrors((e) => ({ ...e, phone: "" })); }}
                              placeholder="9876543210"
                              error={editErrors.phone}
                            />
                            <Field
                              icon={Building2}
                              label="Clinic Name"
                              value={editDraft.clinic ?? ""}
                              onChange={(v) => setEditDraft((d) => ({ ...d, clinic: v }))}
                              placeholder="Sunrise Clinic"
                            />
                            <Field
                              icon={CalendarDays}
                              label="Date Sent"
                              value={editDraft.dateSent ?? ""}
                              onChange={(v) => setEditDraft((d) => ({ ...d, dateSent: v }))}
                              placeholder="15 Mar 2026"
                            />
                            <Field
                              icon={MapPin}
                              label="Address"
                              value={editDraft.address ?? ""}
                              onChange={(v) => setEditDraft((d) => ({ ...d, address: v }))}
                              placeholder="Andheri West, Mumbai"
                              className="col-span-2"
                            />
                            <Field
                              icon={StickyNote}
                              label="Notes"
                              value={editDraft.notes ?? ""}
                              onChange={(v) => setEditDraft((d) => ({ ...d, notes: v }))}
                              placeholder="Interested in full plan, follow up Friday..."
                              className="col-span-2"
                            />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button onClick={saveEdit} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                              Save Details
                            </button>
                            <button onClick={() => { setEditingSlot(null); setEditErrors({}); }} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
                          {record.assignedTo ? (
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 flex-1 text-xs">
                              {record.phone && (
                                <DetailItem icon={Phone} label="Phone" value={record.phone} />
                              )}
                              {record.clinic && (
                                <DetailItem icon={Building2} label="Clinic" value={record.clinic} />
                              )}
                              {record.dateSent && (
                                <DetailItem icon={CalendarDays} label="Date Sent" value={record.dateSent} />
                              )}
                              {record.address && (
                                <DetailItem icon={MapPin} label="Address" value={record.address} />
                              )}
                              {record.notes && (
                                <DetailItem icon={MessageSquareMore} label="Notes" value={record.notes} className="col-span-2" />
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">No details added yet. Assign this slot to a doctor.</p>
                          )}
                          <button
                            onClick={() => startEdit(record)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors font-medium shrink-0"
                          >
                            {record.assignedTo ? "Edit" : "Assign Slot"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Outreach Templates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-gray-700">Outreach Templates</p>
            <p className="text-xs text-gray-400">Click to copy · personalise before sending</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <OutreachTemplate
              icon={MessageCircle}
              iconBg="bg-green-50"
              iconColor="text-green-600"
              label="WhatsApp — Cold Outreach"
              badge="WhatsApp"
              badgeColor="bg-green-50 text-green-700 border-green-200"
              template={`Hi Doctor 👋

I'm Devanshu — I build products for Indian healthcare. Recently I worked on *MediBook*, a simple appointment booking & tracking tool built specifically for clinics like yours.

It handles:
✅ Patient appointment scheduling
✅ Booking history & tracking
✅ Doctor + reception logins
✅ Analytics & daily overview

I'm looking for 20 doctors to try it for free and share honest feedback.

🎁 You'll get free access — no credit card, no commitment.

👉 Check it out: https://medi-book-theta.vercel.app/
🌐 More about me: https://devanshuverma.in

Would you be open to trying it and sharing your thoughts? Even 5 minutes of feedback would mean a lot 🙏

Reply *YES* and I'll send your login details right away.`}
              onCopy={copyText}
              copiedKey={copiedKey}
            />

            <OutreachTemplate
              icon={Linkedin}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              label="LinkedIn DM"
              badge="LinkedIn"
              badgeColor="bg-blue-50 text-blue-700 border-blue-200"
              template={`Hi [Doctor's Name],

I came across your profile and wanted to reach out — I'm Devanshu, a developer who builds tools for Indian healthcare professionals.

I recently built MediBook, a lightweight clinic management tool designed for doctors managing their own practice. It covers appointment booking, patient tracking, and a simple analytics dashboard — nothing bloated, just what you actually need day-to-day.

I'm currently onboarding a small group of 20 doctors for free to gather real feedback before a wider launch.

🔗 Live demo: https://medi-book-theta.vercel.app/
🌐 My work: https://devanshuverma.in

Would you be open to a quick 10-minute conversation about how you currently manage bookings? Happy to set you up with free access right away.

Best,
Devanshu`}
              onCopy={copyText}
              copiedKey={copiedKey}
            />

            <OutreachTemplate
              icon={Globe}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              label="Follow-up Message"
              badge="Follow-up"
              badgeColor="bg-indigo-50 text-indigo-700 border-indigo-200"
              template={`Hi Doctor 👋 Just following up on my earlier message about MediBook.

I know you're busy — this will take less than 2 minutes.

Here's your free demo login:
📧 Email: [dr_email]
🔑 Password: [dr_password]

👉 https://medi-book-theta.vercel.app/

Try booking a patient, check the calendar view, and let me know what you think. Your feedback (even critical!) helps me build something genuinely useful for clinics.

No pressure at all — happy to answer any questions 🙏`}
              onCopy={copyText}
              copiedKey={copiedKey}
            />
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          MediBook Admin · Data stored locally in your browser
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, iconClass, bgClass, valueClass }: {
  icon: React.ElementType; label: string; value: number;
  iconClass: string; bgClass: string; valueClass: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={iconClass} />
      </div>
      <div>
        <p className={`text-2xl font-bold leading-tight ${valueClass}`}>{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function CredCard({ title, accent, email, password, onCopy, copiedKey }: {
  title: string; accent: "indigo" | "teal";
  email: string; password: string;
  onCopy: (v: string, k: string) => void; copiedKey: string | null;
}) {
  const colors = {
    indigo: { border: "border-indigo-100", bg: "bg-indigo-50/60", title: "text-indigo-600", row: "bg-white border-indigo-100" },
    teal:   { border: "border-teal-100",   bg: "bg-teal-50/60",   title: "text-teal-600",   row: "bg-white border-teal-100"   },
  }[accent];

  return (
    <div className={`border ${colors.border} ${colors.bg} rounded-xl p-3 space-y-2`}>
      <p className={`text-[10px] font-bold uppercase tracking-wider ${colors.title}`}>{title}</p>
      <CredRow label="Email" value={email} onCopy={onCopy} copiedKey={copiedKey} rowClass={`${colors.row}`} />
      <CredRow label="Password" value={password} onCopy={onCopy} copiedKey={copiedKey} rowClass={`${colors.row}`} />
    </div>
  );
}

function CredRow({ label, value, onCopy, copiedKey, rowClass }: {
  label: string; value: string;
  onCopy: (v: string, k: string) => void; copiedKey: string | null;
  rowClass?: string;
}) {
  const key = `cred-${value}`;
  const copied = copiedKey === key;
  return (
    <div className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border ${rowClass}`}>
      <div className="min-w-0">
        <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-xs text-gray-800 font-mono truncate">{value}</p>
      </div>
      <button
        onClick={() => onCopy(value, key)}
        className={`w-6 h-6 rounded flex items-center justify-center transition-colors shrink-0 ${copied ? "text-emerald-500" : "text-gray-400 hover:text-gray-700"}`}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
      </button>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder, error, className }: {
  icon?: React.ElementType; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  error?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{label}</label>
      <div className="relative">
        {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white border rounded-lg ${Icon ? "pl-8" : "pl-3"} pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition-all ${
            error
              ? "border-red-300 focus:ring-red-100"
              : "border-gray-200 focus:ring-indigo-100 focus:border-indigo-400"
          }`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, className }: {
  icon: React.ElementType; label: string; value: string; className?: string;
}) {
  return (
    <div className={`flex items-start gap-2 ${className ?? ""}`}>
      <Icon size={12} className="text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xs text-gray-700">{value}</p>
      </div>
    </div>
  );
}

function OutreachTemplate({ icon: Icon, iconBg, iconColor, label, badge, badgeColor, template, onCopy, copiedKey }: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  label: string; badge: string; badgeColor: string;
  template: string;
  onCopy: (text: string, key: string) => void; copiedKey: string | null;
}) {
  const key = `template-${label}`;
  const copied = copiedKey === key;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={15} className={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-800">{label}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>{badge}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{template.split("\n")[0]}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onCopy(template, key); }}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors shrink-0 ${
            copied
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
          }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <span className="text-gray-300 shrink-0">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </div>

      {/* Expanded preview */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-sans bg-gray-50 rounded-lg p-4 border border-gray-100">
            {template}
          </pre>
        </div>
      )}
    </div>
  );
}
