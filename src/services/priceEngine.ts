import CROP_META_JSON from "../data/cropMeta.json";
import type {
  CalculationInputs,
  CalculationResult,
  CalculationRow,
  CropMetaMap,
  CropName,
  Quality,
} from "../types/domain";
import {
  PRICE_UNCERTAINTY_BASE,
  QUALITY_TIERS,
  YIELD_UNCERTAINTY_CV,
  Z_95,
} from "../utils/constants";
import { absMonthToLabel } from "../utils/format";
import { getPriceForAbsMonth, isAnomalousPrice } from "./seasonalIndex";
import { findOptimalPlantingWindow } from "./planner";

const CROP_META = CROP_META_JSON as CropMetaMap;
const VALID_CROPS = new Set<CropName>(Object.keys(CROP_META) as CropName[]);

export { PRICE_UNCERTAINTY_BASE, QUALITY_TIERS, YIELD_UNCERTAINTY_CV } from "../utils/constants";
export { getPriceForAbsMonth } from "./seasonalIndex";

export function calcCI(
  price: number,
  quality: Quality,
  yieldPerHa: number,
  hectares: number,
  totalCost: number,
  farmgateDiscount: number,
): Omit<CalculationRow, "month" | "absMonth" | "isHarvestWindow" | "isStorageWindow" | "isAnomaly" | "profitBand"> {
  const tier = QUALITY_TIERS[quality] || QUALITY_TIERS.MED;
  const farmgatePrice = price * farmgateDiscount;
  const priceStdDev = farmgatePrice * PRICE_UNCERTAINTY_BASE * tier.ciMultiplier;
  const totalYield = yieldPerHa * hectares * 1000;
  const yieldStdDev = totalYield * YIELD_UNCERTAINTY_CV;
  const revenue = farmgatePrice * totalYield;
  const revVariance =
    totalYield ** 2 * priceStdDev ** 2 +
    farmgatePrice ** 2 * yieldStdDev ** 2 +
    priceStdDev ** 2 * yieldStdDev ** 2;
  const revStdDev = Math.sqrt(revVariance);
  const profit = revenue - totalCost;

  return {
    price: farmgatePrice,
    marketPrice: price,
    priceConfLow: Math.max(0, farmgatePrice - Z_95 * priceStdDev),
    priceConfHigh: farmgatePrice + Z_95 * priceStdDev,
    revenue,
    profit,
    profitLow: Math.max(-totalCost, revenue - Z_95 * revStdDev) - totalCost,
    profitHigh: revenue + Z_95 * revStdDev - totalCost,
    quality,
  };
}

export function runCalculation(inputs: CalculationInputs): CalculationResult | null {
  const {
    crop,
    plantMonth,
    hectares,
    seedCost,
    maintenanceCost,
    labourCost,
    otherCost,
    yieldPerHa,
    storageWeeks,
    plantYear,
    today,
  } = inputs;

  if (!crop || !VALID_CROPS.has(crop) || hectares <= 0 || yieldPerHa <= 0) return null;

  const meta = CROP_META[crop];
  const totalCost = (seedCost || 0) + (maintenanceCost || 0) + (labourCost || 0) + (otherCost || 0);
  const plantIdx = plantYear * 12 + plantMonth - 1;
  const earliest = plantIdx + meta.growthMonths.min;
  const latest = plantIdx + meta.growthMonths.max;
  const storageMonths = Math.floor((storageWeeks || 0) / 4);
  const sellEnd = latest + storageMonths;

  const results: CalculationRow[] = [];
  for (let m = earliest; m <= sellEnd; m++) {
    const pricePoint = getPriceForAbsMonth(m, crop);
    if (!pricePoint) continue;
    const ci = calcCI(pricePoint.price, pricePoint.quality, yieldPerHa, hectares, totalCost, meta.farmgateDiscount);
    results.push({
      month: absMonthToLabel(m),
      absMonth: m,
      isHarvestWindow: m >= earliest && m <= latest,
      isStorageWindow: m > latest,
      isAnomaly: isAnomalousPrice(crop, m, pricePoint.price),
      ...ci,
      profitBand: ci.profitHigh,
    });
  }

  if (results.length === 0) return null;

  const scoreResult = (r: CalculationRow) => {
    const tier = QUALITY_TIERS[r.quality] || QUALITY_TIERS.MED;
    return r.profit * tier.score * (r.isAnomaly ? 0.85 : 1);
  };
  const best = results.reduce((a, b) => (scoreResult(a) > scoreResult(b) ? a : b));
  const worst = results.reduce((a, b) => (a.profit < b.profit ? a : b));
  const calcToday = today || new Date();
  const advisor = findOptimalPlantingWindow(crop, calcToday.getFullYear(), calcToday.getMonth() + 1);
  const percentDiff = worst.profit !== 0
    ? Math.round(((best.profit - worst.profit) / Math.abs(worst.profit)) * 100)
    : null;

  return {
    results,
    best,
    worst,
    totalCost,
    farmgateDiscount: meta.farmgateDiscount,
    advisor,
    percentDiff,
    coversCosts: best.profitLow >= 0,
    storageWeeksIgnored: (storageWeeks || 0) > 0 && storageMonths === 0,
    singlePoint: results.length === 1,
    hasProjectedBest: best.quality === "EST" || best.quality === "PROJ",
    hasAnomalousBest: best.isAnomaly,
    bestProfitHasLossRisk: best.profitLow < 0,
  };
}
