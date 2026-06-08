export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "-";
  if (Math.abs(n) >= 1e6) return `NGN${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `NGN${(n / 1e3).toFixed(1)}K`;
  return `NGN${n.toFixed(0)}`;
}

export function fmtPrice(n: number): string {
  return `NGN${Number(n).toFixed(0)}/kg`;
}

import { MONTH_NAMES } from "./constants";

export function absMonthToLabel(absMonth: number): string {
  const yr = Math.floor(absMonth / 12);
  const mo = absMonth % 12;
  return `${MONTH_NAMES[mo]}-${String(yr).slice(2)}`;
}
