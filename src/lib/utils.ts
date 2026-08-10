import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CITY_ALIASES: Record<string, string> = {
  banglore: "Bangalore",
  bangaluru: "Bangalore",
  bengaluru: "Bangalore",
  bengalore: "Bangalore",
  bombay: "Mumbai",
  madras: "Chennai",
  calcutta: "Kolkata",
  "new delhi": "Delhi",
};

export function normalizeLocation(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (CITY_ALIASES[trimmed]) return CITY_ALIASES[trimmed];
  return trimmed.replace(/\b\w/g, (c) => c.toUpperCase());
}
