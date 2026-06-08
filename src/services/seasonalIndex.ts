import PRICE_DATA_JSON from "../data/priceData.json";
import type { CropName, PriceData, PricePoint } from "../types/domain";
import { ANOMALY_THRESHOLD, MONTH_NAMES } from "../utils/constants";

const PRICE_DATA = PRICE_DATA_JSON as PriceData;

export function monthIndexFromLabel(label: string): number {
  const [m, y] = label.split("-");
  const mi = (MONTH_NAMES as readonly string[]).indexOf(m);
  const yr = y.length === 4 ? Number(y) : Number(`20${y}`);
  if (mi < 0 || !Number.isFinite(yr)) return NaN;
  return yr * 12 + mi;
}

export function buildSeasonalIndex(crop: CropName): { avgByMonth: number[]; slope: number; lastPrice: number } {
  const rows = PRICE_DATA[crop] ?? [];
  const byCalMonth: number[][] = Array.from({ length: 12 }, () => []);
  for (const row of rows) {
    const mi = (MONTH_NAMES as readonly string[]).indexOf(row.month.split("-")[0]);
    if (mi >= 0) byCalMonth[mi].push(row.price);
  }

  const avgByMonth = byCalMonth.map(arr => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null));
  for (let i = 0; i < 12; i++) {
    if (avgByMonth[i] !== null) continue;
    for (let d = 1; d < 12; d++) {
      const fwd = avgByMonth[(i + d) % 12];
      const bwd = avgByMonth[(i - d + 12) % 12];
      if (fwd !== null) { avgByMonth[i] = fwd; break; }
      if (bwd !== null) { avgByMonth[i] = bwd; break; }
    }
  }

  const n = rows.length;
  if (n < 2) return { avgByMonth: avgByMonth.map(v => v ?? 1), slope: 0, lastPrice: rows[0]?.price ?? 0 };

  const xs = rows.map((_, i) => i);
  const ys = rows.map(r => r.price);
  const sx = xs.reduce((a, b) => a + b, 0);
  const sy = ys.reduce((a, b) => a + b, 0);
  const sxx = xs.reduce((a, b) => a + b * b, 0);
  const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const denominator = n * sxx - sx * sx;
  const slope = denominator === 0 ? 0 : (n * sxy - sx * sy) / denominator;
  return { avgByMonth: avgByMonth.map(v => v ?? 1), slope, lastPrice: rows[rows.length - 1]?.price ?? 0 };
}

export const PRICE_INDEX = Object.fromEntries(
  (Object.keys(PRICE_DATA) as CropName[]).map(crop => {
    const byMonth = new Map<number, PricePoint>(PRICE_DATA[crop].map(row => [monthIndexFromLabel(row.month), row]));
    const indices = [...byMonth.keys()].filter(Number.isFinite);
    return [crop, { byMonth, minIdx: Math.min(...indices), maxIdx: Math.max(...indices) }];
  }),
) as Record<CropName, { byMonth: Map<number, PricePoint>; minIdx: number; maxIdx: number }>;

const SEASONAL_INDEX = Object.fromEntries(
  (Object.keys(PRICE_DATA) as CropName[]).map(crop => [crop, buildSeasonalIndex(crop)]),
) as Record<CropName, { avgByMonth: number[]; slope: number; lastPrice: number }>;

export function projectPrice(absMonth: number, crop: CropName): PricePoint | null {
  const index = PRICE_INDEX[crop];
  const seasonal = SEASONAL_INDEX[crop];
  if (!seasonal || !index) return null;
  const monthsAhead = absMonth - index.maxIdx;
  if (monthsAhead <= 0) return null;
  const calMonth = absMonth % 12;
  const lastCalMonth = index.maxIdx % 12;
  const sLast = seasonal.avgByMonth[lastCalMonth] || 1;
  const sTgt = seasonal.avgByMonth[calMonth] || 1;
  const seasonalFactor = sTgt / sLast;
  const trendAdj = seasonal.slope * Math.min(monthsAhead, 24) * 0.5;
  return { month: "", price: Math.round(Math.max(100, seasonal.lastPrice * seasonalFactor + trendAdj)), quality: "PROJ" };
}

export function getPriceForAbsMonth(absMonth: number, crop: CropName): PricePoint | null {
  const index = PRICE_INDEX[crop];
  if (!index) return null;
  if (absMonth >= index.minIdx && absMonth <= index.maxIdx) return index.byMonth.get(absMonth) || null;
  if (absMonth > index.maxIdx) return projectPrice(absMonth, crop);
  return null;
}

export function isAnomalousPrice(crop: CropName, absMonth: number, price: number): boolean {
  const prev = PRICE_INDEX[crop]?.byMonth.get(absMonth - 1);
  return Boolean(prev && prev.price > 0 && Math.abs(price - prev.price) / prev.price > ANOMALY_THRESHOLD);
}
