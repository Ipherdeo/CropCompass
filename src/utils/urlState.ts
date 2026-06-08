import CROP_META from "../data/cropMeta.json";
import AREA_UNITS from "../data/areaUnits.json";
import type { AreaUnits, CropMetaMap, CropName, DecodeStateResult, SharedState } from "../types";

const cropMeta = CROP_META as CropMetaMap;
const areaUnits = AREA_UNITS as AreaUnits;
const VALID_CROPS = new Set<CropName>(Object.keys(cropMeta) as CropName[]);

export const URL_KEYS = [
  "crop",
  "plantYear",
  "plantMonth",
  "hectares",
  "areaUnit",
  "seedCost",
  "maintenanceCost",
  "labourCost",
  "otherCost",
  "storageWeeks",
  "yieldLocalUnit",
  "yieldLocalCount",
] as const;

export function encodeState(s: SharedState): string {
  const p = new URLSearchParams();
  URL_KEYS.forEach(k => p.set(k, String(s[k])));
  return p.toString();
}

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const inRange = (value: number, min: number, max: number) => value >= min && value <= max;

export function decodeState(search: string): DecodeStateResult {
  const p = new URLSearchParams(search);
  if (!URL_KEYS.every(k => p.has(k))) return { ok: false, reason: "missing_keys" };

  const crop = p.get("crop") as CropName | null;
  const areaUnit = p.get("areaUnit") as SharedState["areaUnit"] | null;
  if (!crop || !VALID_CROPS.has(crop)) return { ok: false, reason: "invalid_crop" };
  if (!areaUnit || !areaUnits[areaUnit]) return { ok: false, reason: "invalid_unit" };

  const numeric = {
    plantYear: Number(p.get("plantYear")),
    plantMonth: Number(p.get("plantMonth")),
    hectares: Number(p.get("hectares")),
    seedCost: Number(p.get("seedCost")),
    maintenanceCost: Number(p.get("maintenanceCost")),
    labourCost: Number(p.get("labourCost")),
    otherCost: Number(p.get("otherCost")),
    storageWeeks: Number(p.get("storageWeeks")),
    yieldLocalUnit: Number(p.get("yieldLocalUnit")),
    yieldLocalCount: Number(p.get("yieldLocalCount")),
  };

  if (!Object.values(numeric).every(isFiniteNumber)) return { ok: false, reason: "invalid_number" };
  if (!inRange(numeric.plantYear, 2023, 2035)) return { ok: false, reason: "invalid_plant_year" };
  if (!inRange(numeric.plantMonth, 1, 12)) return { ok: false, reason: "invalid_plant_month" };
  if (!inRange(numeric.hectares, 0.023, 20)) return { ok: false, reason: "invalid_hectares" };
  if (![numeric.seedCost, numeric.maintenanceCost, numeric.labourCost, numeric.otherCost].every(v => inRange(v, 0, 500000))) {
    return { ok: false, reason: "invalid_cost" };
  }
  if (!inRange(numeric.storageWeeks, 0, 52)) return { ok: false, reason: "invalid_storage" };
  if (!Number.isInteger(numeric.yieldLocalUnit) || !inRange(numeric.yieldLocalUnit, 0, 10)) return { ok: false, reason: "invalid_yield_unit" };
  if (!inRange(numeric.yieldLocalCount, 0, 1000000)) return { ok: false, reason: "invalid_yield_count" };

  return { ok: true, state: { crop, areaUnit, ...numeric } };
}
