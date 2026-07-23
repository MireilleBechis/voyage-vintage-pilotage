import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const EUR = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const EUR2 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export function eur(value: number | string | null | undefined, precise = false): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  return (precise ? EUR2 : EUR).format(n);
}

export function eurOrNull(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return null;
  return EUR.format(n);
}

export function dateFr(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? parseISO(value) : value;
  try {
    return format(d, "dd/MM/yyyy", { locale: fr });
  } catch {
    return "—";
  }
}

export function anciennete(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? parseISO(value) : value;
  try {
    return formatDistanceToNowStrict(d, { locale: fr, addSuffix: false });
  } catch {
    return "—";
  }
}
