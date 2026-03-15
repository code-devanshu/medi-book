export function validateEmail(value: string): string {
  if (!value.trim()) return "Email is required";
  if (!/\S+@\S+\.\S+/.test(value)) return "Enter a valid email address";
  return "";
}

export function validateOptionalEmail(value: string): string {
  if (value.trim() && !/\S+@\S+\.\S+/.test(value)) return "Enter a valid email address";
  return "";
}

export function validatePhone(value: string): string {
  if (!value.trim()) return "Phone is required";
  const stripped = value.replace(/[\s\-()+]/g, "");
  if (!/^(\+91)?[6-9]\d{9}$/.test(stripped)) return "Enter a valid 10-digit mobile number";
  return "";
}
