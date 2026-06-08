import type { CSSProperties, ReactNode } from "react";

export type CropName = "Cassava" | "Maize" | "Plantain" | "Tomato" | "Yam";
export type Quality = "HIGH" | "MED" | "LOW" | "EST" | "PROJ";
export type AreaUnitName = "plots" | "acres" | "hectares";

export interface PricePoint {
  month: string;
  price: number;
  quality: Quality;
}

export type PriceData = Record<CropName, PricePoint[]>;

export interface AreaUnit {
  toHa: number;
  symbol: string;
}

export type AreaUnits = Record<AreaUnitName, AreaUnit>;

export interface LocalYieldUnit {
  label: string;
  ratio: number;
  peakPerHa: number;
}

export type LocalYieldUnits = Record<CropName, LocalYieldUnit[]>;

export interface CropMeta {
  emoji: string;
  growthMonths: { min: number; max: number };
  yieldRange: { min: number; max: number };
  defaultYield: number;
  farmgateDiscount: number;
  seedCostHintPerHa: number;
  maintenanceCostHintPerHa: number;
  labourCostHintPerHa: number;
  otherCostHintPerHa: number;
  note: string;
  color: string;
  seasonNarrative: { lean: string; peak: string };
}

export type CropMetaMap = Record<CropName, CropMeta>;

export interface FertSplit {
  fraction: number;
  weekAfterPlanting: number;
  label: string;
}

export interface FertRec {
  type: string;
  kgPerHa: number;
  note: string;
  splits: FertSplit[];
}

export type FertRecMap = Record<CropName, FertRec>;

export interface FertPricePoint {
  yr: number;
  mo: number;
  price: number;
}

export interface CalculationInputs {
  crop: CropName | null;
  plantYear: number;
  plantMonth: number;
  hectares: number;
  seedCost: number;
  maintenanceCost: number;
  labourCost: number;
  otherCost: number;
  yieldPerHa: number;
  storageWeeks: number;
  today?: Date;
}

export interface AdvisorResult {
  plantMonthName: string;
  sellLabel: string;
  sellMonthName: string;
  plantYear: number;
  estPrice: number;
}

export interface CalculationRow {
  month: string;
  absMonth: number;
  isHarvestWindow: boolean;
  isStorageWindow: boolean;
  isAnomaly: boolean;
  price: number;
  marketPrice: number;
  priceConfLow: number;
  priceConfHigh: number;
  revenue: number;
  profit: number;
  profitLow: number;
  profitHigh: number;
  quality: Quality;
  profitBand: number;
}

export interface CalculationResult {
  results: CalculationRow[];
  best: CalculationRow;
  worst: CalculationRow;
  totalCost: number;
  farmgateDiscount: number;
  advisor: AdvisorResult | null;
  percentDiff: number | null;
  coversCosts: boolean;
  storageWeeksIgnored: boolean;
  singlePoint: boolean;
  hasProjectedBest: boolean;
  hasAnomalousBest: boolean;
  bestProfitHasLossRisk: boolean;
}

export interface FertSuggestionSplit extends FertSplit {
  bags: number;
  cost: number;
}

export interface FertSuggestion {
  bags: number;
  totalCost: number;
  pricePerBag: number;
  splitSchedule: FertSuggestionSplit[];
  type: string;
  note: string;
}

export interface SharedState {
  crop: CropName;
  plantYear: number;
  plantMonth: number;
  hectares: number;
  areaUnit: AreaUnitName;
  seedCost: number;
  maintenanceCost: number;
  labourCost: number;
  otherCost: number;
  storageWeeks: number;
  yieldLocalUnit: number;
  yieldLocalCount: number;
}

export type DecodeStateResult =
  | { ok: true; state: SharedState }
  | { ok: false; reason: string };

export interface AlertBannerProps {
  variant?: "amber" | "red" | "green";
  children: ReactNode;
  style?: CSSProperties;
}

export interface AppState {
  crop: CropName | null;
  plantYear: number;
  plantMonth: number;
  hectares: number;
  yieldPerHa: number;
  seedCostPerHa: number;
  maintenanceCostPerHa: number;
  labourCostPerHa: number;
  otherCostPerHa: number;
  storageWeeks: number;
}

export interface CalculationOverrides extends Omit<CalculationInputs, "today"> {}
