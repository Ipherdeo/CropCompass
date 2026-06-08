import type { Quality } from "../types/domain";

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
export const FULL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

export const QUALITY_TIERS = {
  HIGH: { ciMultiplier: 1.0, score: 1.0, color: "#2E7D32" },
  MED: { ciMultiplier: 1.15, score: 0.92, color: "#F57F17" },
  LOW: { ciMultiplier: 1.35, score: 0.78, color: "#B71C1C" },
  EST: { ciMultiplier: 1.6, score: 0.62, color: "#E65100" },
  PROJ: { ciMultiplier: 1.9, score: 0.5, color: "#6A1B9A" },
} satisfies Record<Quality, { ciMultiplier: number; score: number; color: string }>;

export const Z_95 = 1.96;
export const PRICE_UNCERTAINTY_BASE = 0.05;
export const YIELD_UNCERTAINTY_CV = 0.15;
export const ANOMALY_THRESHOLD = 0.4;

export const LOADING_PHRASES = [
  "Scanning 35 months of SW Nigeria price records...",
  "Mapping harvest window against sell opportunities...",
  "Propagating yield and price uncertainty...",
  "Finding your optimal sell window...",
] as const;
