import CROP_META_JSON from "../data/cropMeta.json";
import FERT_REC_JSON from "../data/fertRec.json";
import FERT_PRICE_HISTORY_JSON from "../data/fertPriceHistory.json";
import type { AdvisorResult, CropMetaMap, CropName, FertPricePoint, FertRecMap, FertSuggestion } from "../types/domain";
import { FULL_MONTHS, QUALITY_TIERS } from "../utils/constants";
import { absMonthToLabel } from "../utils/format";
import { getPriceForAbsMonth } from "./seasonalIndex";

const CROP_META = CROP_META_JSON as CropMetaMap;
const FERT_REC = FERT_REC_JSON as FertRecMap;
const FERT_PRICE_HISTORY = FERT_PRICE_HISTORY_JSON as FertPricePoint[];

export function findOptimalPlantingWindow(crop: CropName, fromYear: number, fromMonth: number): AdvisorResult | null {
  const meta = CROP_META[crop];
  let bestScore = -Infinity;
  let bestPlantAbs: number | null = null;
  let bestSellAbs: number | null = null;

  for (let offset = 0; offset < 12; offset++) {
    const pmAbs = fromYear * 12 + (fromMonth - 1) + offset;
    const harvestMin = pmAbs + meta.growthMonths.min;
    const harvestMax = pmAbs + meta.growthMonths.max;
    for (let hm = harvestMin; hm <= harvestMax; hm++) {
      const pp = getPriceForAbsMonth(hm, crop);
      if (!pp) continue;
      const tier = QUALITY_TIERS[pp.quality] || QUALITY_TIERS.MED;
      const score = pp.price * meta.farmgateDiscount * tier.score;
      if (score > bestScore) {
        bestScore = score;
        bestPlantAbs = pmAbs;
        bestSellAbs = hm;
      }
    }
  }

  if (bestPlantAbs === null || bestSellAbs === null) return null;
  const price = getPriceForAbsMonth(bestSellAbs, crop)?.price ?? 0;
  return {
    plantMonthName: FULL_MONTHS[bestPlantAbs % 12],
    sellLabel: absMonthToLabel(bestSellAbs),
    sellMonthName: FULL_MONTHS[bestSellAbs % 12],
    plantYear: Math.floor(bestPlantAbs / 12),
    estPrice: price * meta.farmgateDiscount,
  };
}

export function estimateFertPrice(year: number, month: number): number {
  const tgt = year * 12 + month;
  const pts = FERT_PRICE_HISTORY.map(p => ({ idx: p.yr * 12 + p.mo, price: p.price }));
  if (tgt <= pts[0].idx) return pts[0].price;
  if (tgt >= pts[pts.length - 1].idx) {
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const rate = (last.price - prev.price) / (last.idx - prev.idx);
    return Math.round(last.price + rate * (tgt - last.idx));
  }
  for (let i = 0; i < pts.length - 1; i++) {
    if (tgt >= pts[i].idx && tgt <= pts[i + 1].idx) {
      const f = (tgt - pts[i].idx) / (pts[i + 1].idx - pts[i].idx);
      return Math.round(pts[i].price + f * (pts[i + 1].price - pts[i].price));
    }
  }
  return 35000;
}

export function calcFertSuggestion(crop: CropName, hectares: number, plantYear: number, plantMonth: number): FertSuggestion | null {
  const rec = FERT_REC[crop];
  if (!rec || !hectares) return null;
  const totalKg = rec.kgPerHa * hectares;
  const bags = Math.ceil(totalKg / 50);
  const pricePerBag = estimateFertPrice(plantYear, plantMonth);
  const totalCost = bags * pricePerBag;
  const splitSchedule = rec.splits.map(s => ({
    ...s,
    bags: Math.ceil(bags * s.fraction),
    cost: Math.round(totalCost * s.fraction),
  }));
  return { bags, totalCost, pricePerBag, splitSchedule, type: rec.type, note: rec.note };
}
