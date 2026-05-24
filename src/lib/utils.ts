import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert pence (integer) to pounds string: 15000 → "150.00" */
export function penceToPounds(pence: number): string {
  return (pence / 100).toFixed(2);
}

/** Convert pounds to pence: "150.00" → 15000 */
export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100);
}

/** Convert GBP pence to RMB using configured exchange rate */
export function penceToRMB(pence: number): string {
  const rate = parseFloat(process.env.NEXT_PUBLIC_EXCHANGE_RATE || "9.30");
  return ((pence / 100) * rate).toFixed(2);
}

/** Generate unique order number: ORD-20260524-A1B2C3 */
export function generateOrderNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${date}-${suffix}`;
}
