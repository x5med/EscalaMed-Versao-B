export const FORM_ID = "escalamed_lp_novo";
export const FORM_NAME = "EscalaMED · LP-NOVO";
export const LEAD_SOURCE = "LP-NOVO";

export const roleLabels = {
  "doctor-owner": "Médico com clínica própria",
  "doctor-no-clinic": "Médico sem clínica própria",
  "owner-manager": "Dono ou gestor de clínica",
  other: "Outro",
} as const;

export const revenueLabels = {
  "under-40k": "Até R$ 40 mil",
  "40k-70k": "De R$ 40 mil a R$ 70 mil",
  "70k-100k": "De R$ 70 mil a R$ 100 mil",
  "over-100k": "Acima de R$ 100 mil",
} as const;

export type RoleValue = keyof typeof roleLabels;
export type RevenueValue = keyof typeof revenueLabels;

export type LeadFormPayload = {
  eventId: string;
  name: string;
  phone: string;
  role: string;
  email?: string;
  revenueRange: string;
  diagnosisScore: number;
  diagnosisScenes: string[];
  pageUrl: string;
  referrer: string;
  attribution: Record<string, string>;
  companyWebsite?: string;
};

export function phoneKey(value: string) {
  const digits = value.replace(/\D/g, "");
  const withoutCountry = digits.startsWith("55") && digits.length > 11
    ? digits.slice(2)
    : digits;
  return withoutCountry.replace(/^0+/, "").slice(0, 11);
}

export function formatPhone(value: string) {
  const digits = phoneKey(value);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isValidName(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length >= 3 && normalized.includes(" ") && !/\d/.test(normalized);
}

export function isValidPhone(value: string) {
  const normalized = phoneKey(value);
  return /^\d{10,11}$/.test(normalized) && !/^(\d)\1+$/.test(normalized);
}

export function isValidEmail(value: string) {
  return !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
