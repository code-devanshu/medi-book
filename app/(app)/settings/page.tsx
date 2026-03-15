"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save, Building2, Clock, Globe, Bell, Shield, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_KEY = "medibook_settings";

const DEFAULT_SETTINGS = {
  businessName: "MediBook Multispeciality Clinic",
  businessEmail: "appointments@medibook.in",
  businessPhone: "+91 98200 12345",
  bookingDuration: "20",
  openTime: "09:00",
  closeTime: "20:00",
  timezone: "Asia/Kolkata",
  currency: "INR",
  confirmationEmail: true,
  reminderSms: true,
};

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const field = (name: string, value: string | boolean | null) =>
    setSettings((prev) => ({ ...prev, [name]: value ?? "" }));

  function validateField(name: string, value: string): string {
    if (name === "businessName") {
      if (!value.trim()) return "Business name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
    }
    if (name === "businessEmail") {
      if (!value.trim()) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(value)) return "Enter a valid email address";
    }
    if (name === "businessPhone") {
      if (!value.trim()) return "Phone is required";
      const stripped = value.replace(/[\s\-]/g, "");
      if (!/^(\+91)?[6-9]\d{9}$/.test(stripped)) return "Enter a valid 10-digit mobile number";
    }
    if (name === "openTime") {
      if (!value.trim()) return "Opening time is required";
    }
    if (name === "closeTime") {
      if (!value.trim()) return "Closing time is required";
      if (settings.openTime && value <= settings.openTime) {
        return "Closing time must be after opening time";
      }
    }
    return "";
  }

  function handleBlur(name: string, value: string) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  }

  function handleFieldChange(name: string, value: string) {
    field(name, value);
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
    // Re-validate closeTime if openTime changes and closeTime is touched
    if (name === "openTime" && touched.closeTime) {
      const closeErr = settings.closeTime && settings.closeTime <= value
        ? "Closing time must be after opening time"
        : "";
      setErrors((prev) => ({ ...prev, closeTime: closeErr }));
    }
  }

  const handleSave = async () => {
    // Mark all validated fields as touched
    const allFields = ["businessName", "businessEmail", "businessPhone", "openTime", "closeTime"];
    const newTouched: Record<string, boolean> = {};
    allFields.forEach((f) => { newTouched[f] = true; });
    setTouched((prev) => ({ ...prev, ...newTouched }));

    // Validate all fields
    const newErrors: Record<string, string> = {};
    allFields.forEach((f) => {
      const val = settings[f as keyof typeof settings] as string;
      const err = validateField(f, val);
      if (err) newErrors[f] = err;
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaving(false);
    toast.success("Settings saved!", {
      description: "Your changes have been applied.",
    });
  };

  return (
    <div data-guide="settings-form" className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your business preferences and configuration.
        </p>
      </div>

      {/* Business info */}
      <SettingsSection
        icon={<Building2 size={16} className="text-indigo-600" />}
        title="Business Information"
        description="Your business details shown to customers"
      >
        <div className="space-y-4">
          <FieldRow label="Business Name" error={touched.businessName ? errors.businessName : undefined}>
            <Input
              value={settings.businessName}
              onChange={(e) => handleFieldChange("businessName", e.target.value)}
              onBlur={(e) => handleBlur("businessName", e.target.value)}
              className={cn(
                "h-9 text-sm border-gray-200",
                touched.businessName && errors.businessName && "border-red-300 focus-visible:ring-red-300"
              )}
            />
          </FieldRow>
          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Email" error={touched.businessEmail ? errors.businessEmail : undefined}>
              <Input
                type="email"
                value={settings.businessEmail}
                onChange={(e) => handleFieldChange("businessEmail", e.target.value)}
                onBlur={(e) => handleBlur("businessEmail", e.target.value)}
                className={cn(
                  "h-9 text-sm border-gray-200",
                  touched.businessEmail && errors.businessEmail && "border-red-300 focus-visible:ring-red-300"
                )}
              />
            </FieldRow>
            <FieldRow label="Phone" error={touched.businessPhone ? errors.businessPhone : undefined}>
              <Input
                value={settings.businessPhone}
                onChange={(e) => handleFieldChange("businessPhone", e.target.value)}
                onBlur={(e) => handleBlur("businessPhone", e.target.value)}
                maxLength={10}
                className={cn(
                  "h-9 text-sm border-gray-200",
                  touched.businessPhone && errors.businessPhone && "border-red-300 focus-visible:ring-red-300"
                )}
              />
            </FieldRow>
          </div>
        </div>
      </SettingsSection>

      <Separator />

      {/* Booking settings */}
      <SettingsSection
        icon={<Clock size={16} className="text-indigo-600" />}
        title="Booking Configuration"
        description="Default rules for new bookings"
      >
        <div className="space-y-4">
          <FieldRow label="Default Booking Duration (minutes)">
            <Select
              value={settings.bookingDuration}
              onValueChange={(v) => field("bookingDuration", v)}
            >
              <SelectTrigger className="w-45 h-9 text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["30", "45", "60", "75", "90", "120"].map((d) => (
                  <SelectItem key={d} value={d}>
                    {d} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Opening Time" error={touched.openTime ? errors.openTime : undefined}>
              <Input
                type="time"
                value={settings.openTime}
                onChange={(e) => handleFieldChange("openTime", e.target.value)}
                onBlur={(e) => handleBlur("openTime", e.target.value)}
                className={cn(
                  "h-9 text-sm border-gray-200 w-36",
                  touched.openTime && errors.openTime && "border-red-300 focus-visible:ring-red-300"
                )}
              />
            </FieldRow>
            <FieldRow label="Closing Time" error={touched.closeTime ? errors.closeTime : undefined}>
              <Input
                type="time"
                value={settings.closeTime}
                onChange={(e) => handleFieldChange("closeTime", e.target.value)}
                onBlur={(e) => handleBlur("closeTime", e.target.value)}
                className={cn(
                  "h-9 text-sm border-gray-200 w-36",
                  touched.closeTime && errors.closeTime && "border-red-300 focus-visible:ring-red-300"
                )}
              />
            </FieldRow>
          </div>
        </div>
      </SettingsSection>

      <Separator />

      {/* Locale */}
      <SettingsSection
        icon={<Globe size={16} className="text-indigo-600" />}
        title="Locale & Currency"
        description="Regional preferences"
      >
        <div className="grid grid-cols-2 gap-4">
          <FieldRow label="Timezone">
            <Select
              value={settings.timezone}
              onValueChange={(v) => field("timezone", v)}
            >
              <SelectTrigger className="h-9 text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Kolkata">
                  India (IST, UTC+5:30)
                </SelectItem>
                <SelectItem value="Asia/Dubai">
                  Dubai (GST, UTC+4)
                </SelectItem>
                <SelectItem value="Asia/Singapore">
                  Singapore (SGT, UTC+8)
                </SelectItem>
                <SelectItem value="America/New_York">
                  New York (ET)
                </SelectItem>
                <SelectItem value="America/Los_Angeles">
                  Los Angeles (PT)
                </SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Currency">
            <Select
              value={settings.currency}
              onValueChange={(v) => field("currency", v)}
            >
              <SelectTrigger className="h-9 text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="AED">AED (د.إ)</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
      </SettingsSection>

      <Separator />

      {/* Notifications */}
      <SettingsSection
        icon={<Bell size={16} className="text-indigo-600" />}
        title="Notifications"
        description="Automated customer communications"
      >
        <div className="space-y-3">
          <ToggleRow
            label="Confirmation Email"
            description="Send email when booking is confirmed"
            checked={settings.confirmationEmail}
            onChange={(v) => field("confirmationEmail", v)}
          />
          <ToggleRow
            label="Reminder SMS"
            description="Send SMS reminder 24h before appointment"
            checked={settings.reminderSms}
            onChange={(v) => field("reminderSms", v)}
          />
        </div>
      </SettingsSection>

      <Separator />

      {/* Demo notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <Shield size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">Demo Mode Active</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Settings are saved to your browser and will persist across sessions.
            This is a demo application — no data is sent to a server.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 min-w-30"
        >
          <Save size={13} />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-indigo-50">{icon}</div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function FieldRow({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <Label className="text-xs font-medium text-gray-600 mb-1.5 block">
        {label}
      </Label>
      {children}
      {error && (
        <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
          <AlertCircle size={11} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50/60 transition-colors">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? "bg-indigo-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
