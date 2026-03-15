"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ROLE_DEFAULT } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Stethoscope,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validateField(name: string, value: string): string {
    if (name === "email") {
      if (!value.trim()) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(value)) return "Enter a valid email address";
    }
    if (name === "password") {
      if (!value.trim()) return "Password is required";
      if (value.length < 3) return "Password must be at least 3 characters";
    }
    return "";
  }

  function handleBlur(name: string, value: string) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    setAuthError("");
    if (touched.email) {
      const err = validateField("email", value);
      setErrors((prev) => ({ ...prev, email: err }));
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setAuthError("");
    if (touched.password) {
      const err = validateField("password", value);
      setErrors((prev) => ({ ...prev, password: err }));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    const emailErr = validateField("email", email);
    const passwordErr = validateField("password", password);
    const newErrors = { email: emailErr, password: passwordErr };
    setErrors(newErrors);

    if (emailErr || passwordErr) return;

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      // Derive role from credentials to redirect correctly
      const { MOCK_CREDENTIALS } = await import("@/store/authStore");
      const match = MOCK_CREDENTIALS.find((c) => c.email === email.trim().toLowerCase());
      const dest = match ? ROLE_DEFAULT[match.role] : "/bookings";
      toast.success("Welcome back!", { description: "Redirecting…" });
      router.push(dest);
    } else {
      setAuthError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-indigo-600 flex-col justify-between p-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-indigo-300" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-indigo-400" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-tight">MediBook</p>
              <p className="text-indigo-200 text-xs">Clinic Management System</p>
            </div>
          </div>
        </div>

        <div className="relative space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white leading-snug">
              Manage your clinic<br />appointments with ease
            </h1>
            <p className="mt-3 text-indigo-200 text-sm leading-relaxed">
              All-in-one platform for doctors, pathology labs, and physiotherapy
              centres across India.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Doctor & specialist appointment booking",
              "Pathology & radiology test scheduling",
              "Physiotherapy session management",
              "Patient history & analytics dashboard",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-indigo-300 shrink-0" />
                <span className="text-indigo-100 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-indigo-300 text-xs">
            © 2026 MediBook India · Demo Application
          </p>
        </div>
      </div>

      {/* Right panel – login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-7">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 justify-center mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Stethoscope size={19} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">MediBook</p>
              <p className="text-gray-400 text-xs">Clinic Management</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
            <p className="text-sm text-gray-500 mt-1">
              Access your clinic dashboard
            </p>
          </div>

          {/* Form */}
          <form data-guide="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Email address
              </Label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <Input
                  type="email"
                  placeholder="you@medibook.in"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={(e) => handleBlur("email", e.target.value)}
                  className={cn(
                    "pl-9 h-10 text-sm border-gray-200 focus-visible:ring-indigo-500",
                    touched.email && errors.email && "border-red-300 focus-visible:ring-red-300"
                  )}
                  autoComplete="email"
                />
              </div>
              {touched.email && errors.email && (
                <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
                  <AlertCircle size={11} className="shrink-0" /> {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Password
              </Label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={(e) => handleBlur("password", e.target.value)}
                  className={cn(
                    "pl-9 pr-10 h-10 text-sm border-gray-200 focus-visible:ring-indigo-500",
                    touched.password && errors.password && "border-red-300 focus-visible:ring-red-300"
                  )}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
                  <AlertCircle size={11} className="shrink-0" /> {errors.password}
                </p>
              )}
            </div>

            {authError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {authError}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium gap-2 mt-1"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={15} />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400">
            © 2026 MediBook India
          </p>
        </div>
      </div>
    </div>
  );
}
