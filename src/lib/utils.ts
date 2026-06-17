import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function escapeHtml(text: string | null): string {
  return (text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function stripControlChars(text: string | null): string {
  return (text || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

export function normalizeText(text: string | null): string {
  return stripControlChars(
    (text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
  );
}
