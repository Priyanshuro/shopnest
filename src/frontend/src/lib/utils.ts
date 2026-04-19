import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a number as Indian Rupees: ₹1,299 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

/** Format bigint price (stored as paise → rupees) */
export function formatBigIntPrice(price: bigint): string {
  return formatPrice(Number(price));
}

/** Format a rating to one decimal place */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/** Get a Tailwind bg+text class pair for a category */
export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    Shirts: "bg-blue-100 text-blue-700",
    Dresses: "bg-pink-100 text-pink-700",
    Shoes: "bg-amber-100 text-amber-700",
    Jeans: "bg-indigo-100 text-indigo-700",
    Hoodies: "bg-purple-100 text-purple-700",
    Handbags: "bg-rose-100 text-rose-700",
    Sarees: "bg-red-100 text-red-700",
    Kurtas: "bg-orange-100 text-orange-700",
    Accessories: "bg-teal-100 text-teal-700",
  };
  return map[category] ?? "bg-muted text-muted-foreground";
}

/** Calculate discount percentage */
export function getDiscountPercent(
  original: number,
  discounted: number,
): number {
  if (original <= 0 || discounted >= original) return 0;
  return Math.round(((original - discounted) / original) * 100);
}

/** Truncate text to maxLength with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
