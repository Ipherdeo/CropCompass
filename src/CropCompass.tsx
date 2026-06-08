import { Component, useState, useEffect, useCallback, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

// ─── PRICE DATA ───────────────────────────────────────────────────────────────
// Source: agriprofit_v2.xlsx — AgriProfit AI Commodity Price Database v2
// Last updated: May 30, 2026 | Coverage: 35 months | 5 crops
// Quality tiers: HIGH = direct SW zone extraction, MED = national avg / reverse-calc,
//                LOW = estimated from seasonal trend, EST = 2025–26 estimate (replace with actuals)
// TO UPDATE: change price values and set quality: "HIGH" or "MED" as confirmed.
const PRICE_DATA = {
  Cassava: [
    { month: "May-23", price: 366.99,  quality: "HIGH" },
    { month: "Jun-23", price: 403.15,  quality: "HIGH" },
    { month: "Jul-23", price: 434.73,  quality: "HIGH" },
    { month: "Aug-23", price: 445.00,  quality: "LOW"  },
    { month: "Sep-23", price: 467.89,  quality: "MED"  },
    { month: "Oct-23", price: 490.00,  quality: "MED"  },
    { month: "Nov-23", price: 548.95,  quality: "MED"  },
    { month: "Dec-23", price: 563.07,  quality: "HIGH" },
    { month: "Jan-24", price: 613.27,  quality: "HIGH" },
    { month: "Feb-24", price: 860.00,  quality: "MED"  },
    { month: "Mar-24", price: 894.51,  quality: "HIGH" },
    { month: "Apr-24", price: 870.00,  quality: "MED"  },
    { month: "May-24", price: 1114.72, quality: "MED"  },
    { month: "Jun-24", price: 1199.63, quality: "HIGH" },
    { month: "Jul-24", price: 1175.00, quality: "MED"  },
    { month: "Aug-24", price: 1124.40, quality: "MED"  },
    { month: "Sep-24", price: 1135.47, quality: "HIGH" },
    { month: "Oct-24", price: 1163.95, quality: "HIGH" },
    { month: "Nov-24", price: 1180.00, quality: "MED"  },
    { month: "Dec-24", price: 1175.00, quality: "LOW"  },
    { month: "Jan-25", price: 980.00,  quality: "EST"  },
    { month: "Feb-25", price: 950.00,  quality: "EST"  },
    { month: "Mar-25", price: 900.00,  quality: "EST"  },
    { month: "Apr-25", price: 880.00,  quality: "EST"  },
    { month: "May-25", price: 870.00,  quality: "EST"  },
    { month: "Jun-25", price: 860.00,  quality: "EST"  },
    { month: "Jul-25", price: 855.00,  quality: "EST"  },
    { month: "Aug-25", price: 862.00,  quality: "EST"  },
    { month: "Sep-25", price: 871.78,  quality: "MED"  },
    { month: "Oct-25", price: 1020.00, quality: "MED"  },
    { month: "Nov-25", price: 980.00,  quality: "EST"  },
    { month: "Dec-25", price: 960.00,  quality: "EST"  },
    { month: "Jan-26", price: 820.00,  quality: "EST"  },
    { month: "Feb-26", price: 810.00,  quality: "EST"  },
    { month: "Mar-26", price: 801.54,  quality: "MED"  },
  ],
  Maize: [
    { month: "May-23", price: 363.71,  quality: "HIGH" },
    { month: "Jun-23", price: 378.71,  quality: "HIGH" },
    { month: "Jul-23", price: 536.47,  quality: "HIGH" },
    { month: "Aug-23", price: 540.00,  quality: "LOW"  },
    { month: "Sep-23", price: 566.93,  quality: "MED"  },
    { month: "Oct-23", price: 548.96,  quality: "MED"  },
    { month: "Nov-23", price: 557.33,  quality: "MED"  },
    { month: "Dec-23", price: 529.25,  quality: "HIGH" },
    { month: "Jan-24", price: 527.44,  quality: "HIGH" },
    { month: "Feb-24", price: 560.00,  quality: "MED"  },
    { month: "Mar-24", price: 785.81,  quality: "HIGH" },
    { month: "Apr-24", price: 800.00,  quality: "MED"  },
    { month: "May-24", price: 950.16,  quality: "MED"  },
    { month: "Jun-24", price: 1017.70, quality: "HIGH" },
    { month: "Jul-24", price: 1000.00, quality: "MED"  },
    { month: "Aug-24", price: 1028.33, quality: "MED"  },
    { month: "Sep-24", price: 1138.07, quality: "HIGH" },
    { month: "Oct-24", price: 1156.69, quality: "HIGH" },
    { month: "Nov-24", price: 1170.00, quality: "MED"  },
    { month: "Dec-24", price: 1150.00, quality: "LOW"  },
    { month: "Jan-25", price: 1000.00, quality: "EST"  },
    { month: "Feb-25", price: 980.00,  quality: "EST"  },
    { month: "Mar-25", price: 920.00,  quality: "EST"  },
    { month: "Apr-25", price: 900.00,  quality: "EST"  },
    { month: "May-25", price: 890.00,  quality: "EST"  },
    { month: "Jun-25", price: 880.00,  quality: "EST"  },
    { month: "Jul-25", price: 870.00,  quality: "EST"  },
    { month: "Aug-25", price: 875.00,  quality: "EST"  },
    { month: "Sep-25", price: 880.00,  quality: "MED"  },
    { month: "Oct-25", price: 900.00,  quality: "MED"  },
    { month: "Nov-25", price: 870.00,  quality: "EST"  },
    { month: "Dec-25", price: 850.00,  quality: "EST"  },
    { month: "Jan-26", price: 830.00,  quality: "EST"  },
    { month: "Feb-26", price: 820.00,  quality: "EST"  },
    { month: "Mar-26", price: 810.00,  quality: "MED"  },
  ],
  Plantain: [
    { month: "May-23", price: 559.18,  quality: "HIGH" },
    { month: "Jun-23", price: 450.19,  quality: "HIGH" },
    { month: "Jul-23", price: 597.92,  quality: "HIGH" },
    { month: "Aug-23", price: 620.00,  quality: "LOW"  },
    { month: "Sep-23", price: 586.43,  quality: "MED"  },
    { month: "Oct-23", price: 627.50,  quality: "MED"  },
    { month: "Nov-23", price: 693.65,  quality: "MED"  },
    { month: "Dec-23", price: 913.63,  quality: "HIGH" },
    { month: "Jan-24", price: 924.40,  quality: "HIGH" },
    { month: "Feb-24", price: 880.00,  quality: "MED"  },
    { month: "Mar-24", price: 1080.68, quality: "HIGH" },
    { month: "Apr-24", price: 1050.00, quality: "MED"  },
    { month: "May-24", price: 1106.33, quality: "MED"  },
    { month: "Jun-24", price: 2285.40, quality: "HIGH" },
    { month: "Jul-24", price: 1400.00, quality: "MED"  },
    { month: "Aug-24", price: 1492.63, quality: "MED"  },
    { month: "Sep-24", price: 1941.74, quality: "HIGH" },
    { month: "Oct-24", price: 1978.54, quality: "HIGH" },
    { month: "Nov-24", price: 1960.00, quality: "MED"  },
    { month: "Dec-24", price: 1900.00, quality: "LOW"  },
    { month: "Jan-25", price: 1650.00, quality: "EST"  },
    { month: "Feb-25", price: 1580.00, quality: "EST"  },
    { month: "Mar-25", price: 1500.00, quality: "EST"  },
    { month: "Apr-25", price: 1450.00, quality: "EST"  },
    { month: "May-25", price: 1420.00, quality: "EST"  },
    { month: "Jun-25", price: 1800.00, quality: "EST"  },
    { month: "Jul-25", price: 1900.00, quality: "EST"  },
    { month: "Aug-25", price: 1950.00, quality: "EST"  },
    { month: "Sep-25", price: 1980.00, quality: "MED"  },
    { month: "Oct-25", price: 1970.00, quality: "MED"  },
    { month: "Nov-25", price: 1900.00, quality: "EST"  },
    { month: "Dec-25", price: 1850.00, quality: "EST"  },
    { month: "Jan-26", price: 1600.00, quality: "EST"  },
    { month: "Feb-26", price: 1550.00, quality: "EST"  },
    { month: "Mar-26", price: 1500.00, quality: "MED"  },
  ],
  Tomato: [
    { month: "May-23", price: 511.58,  quality: "HIGH" },
    { month: "Jun-23", price: 547.28,  quality: "HIGH" },
    { month: "Jul-23", price: 678.95,  quality: "HIGH" },
    { month: "Aug-23", price: 660.00,  quality: "LOW"  },
    { month: "Sep-23", price: 565.69,  quality: "MED"  },
    { month: "Oct-23", price: 675.91,  quality: "MED"  },
    { month: "Nov-23", price: 758.65,  quality: "MED"  },
    { month: "Dec-23", price: 1068.17, quality: "HIGH" },
    { month: "Jan-24", price: 1029.25, quality: "HIGH" },
    { month: "Feb-24", price: 960.00,  quality: "MED"  },
    { month: "Mar-24", price: 1067.83, quality: "HIGH" },
    { month: "Apr-24", price: 1123.41, quality: "MED"  },
    { month: "May-24", price: 1479.69, quality: "MED"  },
    { month: "Jun-24", price: 3261.84, quality: "HIGH" },
    { month: "Jul-24", price: 1693.83, quality: "MED"  },
    { month: "Aug-24", price: 1506.35, quality: "MED"  },
    { month: "Sep-24", price: 1595.54, quality: "HIGH" },
    { month: "Oct-24", price: 1717.58, quality: "HIGH" },
    { month: "Nov-24", price: 1700.00, quality: "MED"  },
    { month: "Dec-24", price: 1650.00, quality: "LOW"  },
    { month: "Jan-25", price: 1400.00, quality: "EST"  },
    { month: "Feb-25", price: 1350.00, quality: "EST"  },
    { month: "Mar-25", price: 1300.00, quality: "EST"  },
    { month: "Apr-25", price: 1280.00, quality: "EST"  },
    { month: "May-25", price: 1250.00, quality: "EST"  },
    { month: "Jun-25", price: 1500.00, quality: "EST"  },
    { month: "Jul-25", price: 1600.00, quality: "EST"  },
    { month: "Aug-25", price: 1550.00, quality: "EST"  },
    { month: "Sep-25", price: 1280.00, quality: "MED"  },
    { month: "Oct-25", price: 1269.17, quality: "MED"  },
    { month: "Nov-25", price: 1200.00, quality: "EST"  },
    { month: "Dec-25", price: 1180.00, quality: "EST"  },
    { month: "Jan-26", price: 1150.00, quality: "EST"  },
    { month: "Feb-26", price: 1140.00, quality: "EST"  },
    { month: "Mar-26", price: 1153.14, quality: "MED"  },
  ],
  Yam: [
    { month: "May-23", price: 632.60,  quality: "HIGH" },
    { month: "Jun-23", price: 510.77,  quality: "HIGH" },
    { month: "Jul-23", price: 739.83,  quality: "HIGH" },
    { month: "Aug-23", price: 720.00,  quality: "LOW"  },
    { month: "Sep-23", price: 593.83,  quality: "MED"  },
    { month: "Oct-23", price: 687.68,  quality: "MED"  },
    { month: "Nov-23", price: 700.00,  quality: "MED"  },
    { month: "Dec-23", price: 1163.57, quality: "HIGH" },
    { month: "Jan-24", price: 1033.91, quality: "HIGH" },
    { month: "Feb-24", price: 1009.56, quality: "MED"  },
    { month: "Mar-24", price: 1068.78, quality: "HIGH" },
    { month: "Apr-24", price: 1130.37, quality: "MED"  },
    { month: "May-24", price: 1322.36, quality: "MED"  },
    { month: "Jun-24", price: 2745.80, quality: "HIGH" },
    { month: "Jul-24", price: 1802.84, quality: "MED"  },
    { month: "Aug-24", price: 1661.80, quality: "MED"  },
    { month: "Sep-24", price: 1896.37, quality: "HIGH" },
    { month: "Oct-24", price: 1975.45, quality: "HIGH" },
    { month: "Nov-24", price: 2000.00, quality: "MED"  },
    { month: "Dec-24", price: 1980.00, quality: "LOW"  },
    { month: "Jan-25", price: 1700.00, quality: "EST"  },
    { month: "Feb-25", price: 1650.00, quality: "EST"  },
    { month: "Mar-25", price: 1600.00, quality: "EST"  },
    { month: "Apr-25", price: 1580.00, quality: "EST"  },
    { month: "May-25", price: 1550.00, quality: "EST"  },
    { month: "Jun-25", price: 1700.00, quality: "EST"  },
    { month: "Jul-25", price: 1800.00, quality: "EST"  },
    { month: "Aug-25", price: 1850.00, quality: "EST"  },
    { month: "Sep-25", price: 1900.00, quality: "MED"  },
    { month: "Oct-25", price: 1913.78, quality: "MED"  },
    { month: "Nov-25", price: 1850.00, quality: "EST"  },
    { month: "Dec-25", price: 1800.00, quality: "EST"  },
    { month: "Jan-26", price: 1700.00, quality: "EST"  },
    { month: "Feb-26", price: 1680.00, quality: "EST"  },
    { month: "Mar-26", price: 1650.00, quality: "MED"  },
  ],
};

// ─── AREA UNITS ───────────────────────────────────────────────────────────────
// 1 plot (SW Nigeria standard) = 50×100 ft ≈ 0.0468 ha
const AREA_UNITS = {
  plots:    { toHa: 0.0468, symbol: "plots" },
  acres:    { toHa: 0.4047, symbol: "acres" },
  hectares: { toHa: 1,      symbol: "ha"    },
};

// ─── LOCAL YIELD UNITS ────────────────────────────────────────────────────────
// Farmers enter yield as a local count per farm. t/ha = (count × ratio) / hectares.
// peakPerHa: realistic upper bound in local units per hectare (caps slider max).
const LOCAL_YIELD_UNITS = {
  Cassava:  [
    { label: "90-L baskets",      ratio: 0.027,   peakPerHa: 550  },
    { label: "100 kg bags",       ratio: 0.1,     peakPerHa: 150  },
    { label: "tonnes",            ratio: 1,       peakPerHa: 15   },
  ],
  Maize:    [
    { label: "50 kg bags",        ratio: 0.05,    peakPerHa: 100  },
    { label: "100 kg bags",       ratio: 0.1,     peakPerHa: 50   },
    { label: "tonnes",            ratio: 1,       peakPerHa: 5    },
  ],
  Plantain: [
    { label: "bunches (~10 kg)",  ratio: 0.01,    peakPerHa: 2000 },
    { label: "100 kg crates",     ratio: 0.1,     peakPerHa: 200  },
    { label: "tonnes",            ratio: 1,       peakPerHa: 20   },
  ],
  Tomato:   [
    // Farmer-confirmed: standard SW Nigeria tomato crate is 20-35 kg (varies by market)
    { label: "crates (20-35 kg)", ratio: 0.0275,  peakPerHa: 1450 },
    { label: "half-crates (~15 kg)", ratio: 0.015, peakPerHa: 2660 },
    // Beds: common for nursery-based tomato farmers
    { label: "beds (~0.25 t)",    ratio: 0.25,    peakPerHa: 160  },
    { label: "tonnes",            ratio: 1,       peakPerHa: 40   },
  ],
  Yam:      [
    // Farmer-confirmed: tubers above ~1,500/ha are unrealistic locally - cap enforced
    { label: "tubers (~2 kg)",    ratio: 0.002,   peakPerHa: 1500 },
    // Heaps: each mound/heap holds 1-2 seed yams; ~1,000-1,200 heaps/ha standard
    { label: "heaps (~4 kg/heap)", ratio: 0.004,  peakPerHa: 750  },
    { label: "100 kg bags",       ratio: 0.1,     peakPerHa: 250  },
    { label: "tonnes",            ratio: 1,       peakPerHa: 25   },
  ],
};

// ─── FERTILIZER DATA ─────────────────────────────────────────────────────────
// NPK 50 kg bag price trajectory (SW Nigeria, ₦/bag)
const FERT_PRICE_HISTORY = [
  { yr: 2023, mo: 5,  price: 20000 },
  { yr: 2023, mo: 12, price: 24000 },
  { yr: 2024, mo: 3,  price: 28000 },
  { yr: 2024, mo: 6,  price: 33000 },
  { yr: 2024, mo: 10, price: 37000 },
  { yr: 2025, mo: 3,  price: 42000 },
  { yr: 2025, mo: 8,  price: 45000 },
  { yr: 2026, mo: 3,  price: 50000 },
];

const FERT_REC = {
  Cassava: {
    type: "NPK 20:10:10 or 12:12:17",
    kgPerHa: 300,
    // Cassava is a light feeder — excess N causes leafy growth at the expense of tuber size.
    note: "Don't over-apply — too much fertilizer on cassava gives you leafy plants, not big tubers.",
    splits: [
      { fraction: 0.5, weekAfterPlanting: 6,  label: "At 4–6 weeks" },
      { fraction: 0.5, weekAfterPlanting: 13, label: "At 3 months"  },
    ],
  },
  Maize: {
    type: "NPK 15:15:15 (basal) + Urea top-dress",
    kgPerHa: 400,
    note: "Urea top-dress nitrogen drives grain fill. Don't skip it.",
    splits: [
      { fraction: 0.5, weekAfterPlanting: 0,  label: "At planting (NPK basal)" },
      { fraction: 0.5, weekAfterPlanting: 4,  label: "3–4 weeks (Urea top-dress)" },
    ],
  },
  Plantain: {
    type: "NPK 15:15:15",
    kgPerHa: 250,
    note: "Potassium drives bunch weight. Don't substitute a low-K fertilizer.",
    splits: [
      { fraction: 0.34, weekAfterPlanting: 0,  label: "At planting"  },
      { fraction: 0.33, weekAfterPlanting: 13, label: "At 3 months"  },
      { fraction: 0.33, weekAfterPlanting: 26, label: "At 6 months"  },
    ],
  },
  Tomato: {
    type: "NPK 15:15:15 (basal) + CAN top-dress",
    kgPerHa: 350,
    note: "Skipping the CAN top-dress at flowering is the most common yield-loss cause.",
    splits: [
      { fraction: 0.34, weekAfterPlanting: 0, label: "At transplanting (NPK)" },
      { fraction: 0.33, weekAfterPlanting: 5, label: "At flowering (CAN)"     },
      { fraction: 0.33, weekAfterPlanting: 9, label: "At fruiting (CAN)"      },
    ],
  },
  Yam: {
    type: "NPK 12:12:17 (K-rich)",
    kgPerHa: 300,
    note: "High K supports tuber starch accumulation. Apply before the mound collapses.",
    splits: [
      { fraction: 0.5, weekAfterPlanting: 0, label: "At mound prep"          },
      { fraction: 0.5, weekAfterPlanting: 6, label: "6 weeks after sprouting" },
    ],
  },
};

// ─── CROP META ────────────────────────────────────────────────────────────────
// seedCostHintPerHa values are reference defaults — user adjusts in the UI.
// NOTE: seeds/pesticides are sold in fixed units at Nigerian agro-markets, not
// by volume. These per-ha hints are starting points only; override them.
const CROP_META = {
  Cassava: {
    emoji: "🌿",
    growthMonths: { min: 9, max: 12 },
    yieldRange: { min: 8, max: 15 },
    defaultYield: 10,
    farmgateDiscount: 0.55,
    seedCostHintPerHa: 25000,
    maintenanceCostHintPerHa: 12000,
    labourCostHintPerHa: 20000,
    otherCostHintPerHa: 8000,
    note: "Garri white used as price proxy. Farmgate ~45% below market due to middleman margin.",
    color: "#558B2F",
    seasonNarrative: {
      lean: "Jan–Mar prices drop as stockpiled roots from the prior harvest reach markets.",
      peak: "Oct–Nov prices rise as dry-season demand outpaces supply from the long-season crop.",
    },
  },
  Maize: {
    emoji: "🌽",
    growthMonths: { min: 3, max: 4 },
    yieldRange: { min: 2, max: 5 },
    defaultYield: 3,
    farmgateDiscount: 0.62,
    seedCostHintPerHa: 15000,
    maintenanceCostHintPerHa: 8000,
    labourCostHintPerHa: 15000,
    otherCostHintPerHa: 5000,
    note: "Two seasons possible. Season 1 (Mar–Apr plant) typically yields higher prices at harvest.",
    color: "#F9A825",
    seasonNarrative: {
      lean: "May–Jul prices drop as the main-season harvest floods the market.",
      peak: "Sep–Nov prices recover as off-season stocks run low before the second harvest.",
    },
  },
  Plantain: {
    emoji: "🍌",
    growthMonths: { min: 9, max: 12 },
    yieldRange: { min: 10, max: 20 },
    defaultYield: 12,
    farmgateDiscount: 0.58,
    seedCostHintPerHa: 30000,
    maintenanceCostHintPerHa: 18000,
    labourCostHintPerHa: 22000,
    otherCostHintPerHa: 10000,
    note: "SW Nigeria has the highest national plantain prices. Aug–Oct is the peak window.",
    color: "#FBC02D",
    seasonNarrative: {
      lean: "Feb–Apr prices fall as the long-season crop peaks in SW markets.",
      peak: "Aug–Oct prices spike — lean-season supply shortage drives Sallah demand.",
    },
  },
  Tomato: {
    emoji: "🍅",
    growthMonths: { min: 3, max: 4 },
    yieldRange: { min: 15, max: 40 },
    defaultYield: 17,
    farmgateDiscount: 0.50,
    seedCostHintPerHa: 20000,
    maintenanceCostHintPerHa: 25000,
    labourCostHintPerHa: 18000,
    otherCostHintPerHa: 12000,
    note: "Highly volatile. Jun-24 reached ₦3,262/kg — a real lean-season spike. Build this risk into your timing.",
    color: "#C62828",
    seasonNarrative: {
      lean: "May–Jul prices can spike or crash violently as dry-season supply collapses.",
      peak: "Dec–Feb prices are typically the most stable, driven by harmattan demand.",
    },
  },
  Yam: {
    emoji: "🥔",
    growthMonths: { min: 7, max: 9 },
    yieldRange: { min: 10, max: 25 },
    defaultYield: 12,
    farmgateDiscount: 0.60,
    seedCostHintPerHa: 50000,
    maintenanceCostHintPerHa: 15000,
    labourCostHintPerHa: 25000,
    otherCostHintPerHa: 10000,
    note: "New Yam Festival (Aug–Sep) drives price peaks. Aug–Nov is historically strong.",
    color: "#6D4C41",
    seasonNarrative: {
      lean: "Apr–Jun prices are suppressed as stored yams from the prior season meet early new yam.",
      peak: "Aug–Oct prices peak around New Yam Festival demand.",
    },
  },
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const VALID_CROPS = new Set(Object.keys(CROP_META));

// Quality tier config — single source of truth for all quality-related lookups.
// ciMultiplier: widens the CI band for less reliable price sources.
// score: used to rank sell windows (penalises uncertain months).
// color: dot / badge colour on chart and table.
const QUALITY_TIERS = {
  HIGH: { ciMultiplier: 1.0,  score: 1.0,  color: "#2E7D32" },
  MED:  { ciMultiplier: 1.15, score: 0.92, color: "#F57F17" },
  LOW:  { ciMultiplier: 1.35, score: 0.78, color: "#B71C1C" },
  EST:  { ciMultiplier: 1.6,  score: 0.62, color: "#E65100" },
  PROJ: { ciMultiplier: 1.9,  score: 0.5,  color: "#6A1B9A" },
};

// 95% confidence interval z-score.
const Z_95 = 1.96;

// Price uncertainty base: ±5% of farmgate price per quality tier (before CI multiplier).
// Yield uncertainty: 15% coefficient of variation, calibrated to SW Nigeria smallholder data.
// Both are engineering assumptions — see handoff Priority 6 for empirical replacement plan.
const PRICE_UNCERTAINTY_BASE = 0.05;
const YIELD_UNCERTAINTY_CV   = 0.15;

const LOADING_PHRASES = [
  "Scanning 35 months of SW Nigeria price records…",
  "Mapping harvest window against sell opportunities…",
  "Propagating yield and price uncertainty…",
  "Finding your optimal sell window…",
];

// ─── PRICE ENGINE ─────────────────────────────────────────────────────────────
function monthIndexFromLabel(label) {
  const [m, y] = label.split("-");
  const mi = MONTH_NAMES.indexOf(m);
  const yr = y.length === 4 ? Number(y) : Number(`20${y}`);
  if (mi < 0 || !Number.isFinite(yr)) return NaN;
  return yr * 12 + mi;
}

// Pre-build O(1) lookup index per crop, computed once at module load.
const PRICE_INDEX = Object.fromEntries(
  Object.entries(PRICE_DATA).map(([crop, rows]) => {
    const byMonth = new Map(rows.map(row => [monthIndexFromLabel(row.month), row]));
    const indices = [...byMonth.keys()].filter(Number.isFinite);
    return [crop, { byMonth, minIdx: Math.min(...indices), maxIdx: Math.max(...indices) }];
  })
);

// Per-crop seasonal averages + linear trend slope, used for PROJ-quality projection.
function buildSeasonalIndex(crop) {
  const rows = PRICE_DATA[crop];
  const byCalMonth = Array.from({ length: 12 }, () => []);
  for (const row of rows) {
    const mi = MONTH_NAMES.indexOf(row.month.split("-")[0]);
    if (mi >= 0) byCalMonth[mi].push(row.price);
  }
  const avgByMonth = byCalMonth.map(arr =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null
  );
  // Fill any null calendar months by nearest neighbour.
  for (let i = 0; i < 12; i++) {
    if (avgByMonth[i] !== null) continue;
    for (let d = 1; d < 12; d++) {
      const fwd = avgByMonth[(i + d) % 12];
      const bwd = avgByMonth[(i - d + 12) % 12];
      if (fwd !== null) { avgByMonth[i] = fwd; break; }
      if (bwd !== null) { avgByMonth[i] = bwd; break; }
    }
  }
  // OLS slope over all rows (₦/month), used to extrapolate the trend beyond the dataset.
  const n = rows.length;
  const xs = rows.map((_, i) => i);
  const ys = rows.map(r => r.price);
  const sx  = xs.reduce((a, b) => a + b, 0);
  const sy  = ys.reduce((a, b) => a + b, 0);
  const sxx = xs.reduce((a, b) => a + b * b, 0);
  const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const denom = n * sxx - sx * sx;
  // Guard: if all x-values are identical (single row), slope is undefined — default 0.
  const slope = denom !== 0 ? (n * sxy - sx * sy) / denom : 0;
  return { avgByMonth, slope, lastPrice: rows[rows.length - 1].price };
}

const SEASONAL_INDEX = Object.fromEntries(
  Object.keys(PRICE_DATA).map(c => [c, buildSeasonalIndex(c)])
);

// Projects price beyond the dataset using the seasonal pattern × trend adjustment.
// Capped at 24 months ahead to prevent unbounded extrapolation.
function projectPrice(absMonth, crop) {
  const index    = PRICE_INDEX[crop];
  const seasonal = SEASONAL_INDEX[crop];
  if (!seasonal || !index) return null;
  const monthsAhead = absMonth - index.maxIdx;
  if (monthsAhead <= 0) return null;
  const calMonth     = absMonth % 12;
  const lastCalMonth = index.maxIdx % 12;
  const sLast = seasonal.avgByMonth[lastCalMonth] || 1;
  const sTgt  = seasonal.avgByMonth[calMonth]     || 1;
  const seasonalFactor = sTgt / sLast;
  // 0.5 dampening factor: halves the OLS trend beyond the dataset to prevent
  // runaway extrapolation. Calibrated to keep projections within ±30% at 12 months.
  const TREND_DAMPENING = 0.5;
  const trendAdj = seasonal.slope * Math.min(monthsAhead, 24) * TREND_DAMPENING;
  return { price: Math.round(Math.max(100, seasonal.lastPrice * seasonalFactor + trendAdj)), quality: "PROJ" };
}

function getPriceForAbsMonth(absMonth, crop) {
  const index = PRICE_INDEX[crop];
  if (!index) return null;
  if (absMonth >= index.minIdx && absMonth <= index.maxIdx) return index.byMonth.get(absMonth) || null;
  if (absMonth > index.maxIdx) return projectPrice(absMonth, crop);
  return null;
}

function absMonthToLabel(absMonth) {
  const yr = Math.floor(absMonth / 12);
  const mo = absMonth % 12;
  return `${MONTH_NAMES[mo]}-${String(yr).slice(2)}`;
}

// A 40% month-over-month swing is treated as anomalous — flags the result card
// with a caution so the farmer doesn't anchor to a one-off spike.
const ANOMALY_THRESHOLD = 0.40;
function isAnomalousPrice(crop, absMonth, price) {
  const prev = PRICE_INDEX[crop]?.byMonth.get(absMonth - 1);
  return prev?.price > 0 && Math.abs(price - prev.price) / prev.price > ANOMALY_THRESHOLD;
}

// ─── CONFIDENCE INTERVAL ENGINE ───────────────────────────────────────────────
// Propagates price uncertainty and yield uncertainty into a profit confidence band.
// Uses standard error propagation: Var(P×Q) ≈ Q²·σP² + P²·σQ² + σP²·σQ²
// CI multiplier widens uncertainty for lower-quality price sources (see QUALITY_TIERS).
function calcCI(price, quality, yieldPerHa, hectares, totalCost, farmgateDiscount) {
  const tier          = QUALITY_TIERS[quality] || QUALITY_TIERS.MED;
  const farmgatePrice = price * farmgateDiscount;
  const priceStdDev   = farmgatePrice * PRICE_UNCERTAINTY_BASE * tier.ciMultiplier;
  const totalYield    = yieldPerHa * hectares * 1000; // kg
  const yieldStdDev   = totalYield * YIELD_UNCERTAINTY_CV;
  const revenue       = farmgatePrice * totalYield;
  const revVariance   =
    totalYield ** 2 * priceStdDev ** 2 +
    farmgatePrice ** 2 * yieldStdDev ** 2 +
    priceStdDev ** 2 * yieldStdDev ** 2;
  const revStdDev = Math.sqrt(revVariance);
  const profit    = revenue - totalCost;
  return {
    price:         farmgatePrice,
    marketPrice:   price,
    priceConfLow:  Math.max(0, farmgatePrice - Z_95 * priceStdDev),
    priceConfHigh: farmgatePrice + Z_95 * priceStdDev,
    revenue,
    profit,
    // profitLow = lower CI bound of revenue minus cost.
    // We clamp at -totalCost (worst case: zero revenue) to avoid showing losses
    // larger than the farmer's total investment.
    profitLow:  Math.max(-totalCost, revenue - Z_95 * revStdDev - totalCost),
    profitHigh: revenue + Z_95 * revStdDev - totalCost,
    quality,
    totalYieldKg: totalYield,  // kg — exposed so results view can display expected yield
  };
}

// ─── OPTIMAL PLANTING ADVISOR ─────────────────────────────────────────────────
// Starting from `fromMonth` in `fromYear`, finds the planting month in the next
// 12 calendar months that puts harvest into the historically best sell window.
// Bug fix vs v1.3: now correctly excludes months before fromMonth in fromYear.
function findOptimalPlantingWindow(crop, fromYear, fromMonth) {
  const meta = CROP_META[crop];
  const { min, max } = meta.growthMonths;
  let bestScore = -Infinity, bestPlantAbs = null, bestSellAbs = null;

  for (let offset = 0; offset < 12; offset++) {
    const pmAbs     = fromYear * 12 + (fromMonth - 1) + offset;
    const harvestMin = pmAbs + min;
    const harvestMax = pmAbs + max;
    for (let hm = harvestMin; hm <= harvestMax; hm++) {
      const pp = getPriceForAbsMonth(hm, crop);
      if (!pp) continue;
      const tier  = QUALITY_TIERS[pp.quality] || QUALITY_TIERS.MED;
      const score = pp.price * meta.farmgateDiscount * tier.score;
      if (score > bestScore) {
        bestScore    = score;
        bestPlantAbs = pmAbs;
        bestSellAbs  = hm;
      }
    }
  }
  if (bestPlantAbs === null) return null;
  const plantCalMonth = bestPlantAbs % 12; // 0-based
  return {
    plantMonthName: FULL_MONTHS[plantCalMonth],
    sellLabel:      absMonthToLabel(bestSellAbs),
    sellMonthName:  FULL_MONTHS[bestSellAbs % 12],
    // Include year context so "plant in January" doesn't ambiguously mean this Jan or next.
    plantYear:      Math.floor(bestPlantAbs / 12),
    estPrice:       getPriceForAbsMonth(bestSellAbs, crop)?.price * meta.farmgateDiscount,
  };
}

// ─── CALCULATION ORCHESTRATOR ─────────────────────────────────────────────────
function runCalculation(inputs) {
  const { crop, plantMonth, hectares, seedCost, maintenanceCost, labourCost,
          otherCost, yieldPerHa, storageWeeks, plantYear, today } = inputs;

  if (!VALID_CROPS.has(crop) || !hectares || hectares <= 0 || !yieldPerHa || yieldPerHa <= 0) return null;

  const totalCost        = (seedCost || 0) + (maintenanceCost || 0) + (labourCost || 0) + (otherCost || 0);
  const farmgateDiscount = CROP_META[crop].farmgateDiscount;
  const plantIdx         = plantYear * 12 + plantMonth - 1;
  const { min, max }     = CROP_META[crop].growthMonths;
  const earliest         = plantIdx + min;
  const latest           = plantIdx + max;
  const storageMonths    = Math.floor((storageWeeks || 0) / 4);
  const sellEnd          = latest + storageMonths;

  const results = [];
  for (let m = earliest; m <= sellEnd; m++) {
    const pricePoint = getPriceForAbsMonth(m, crop);
    if (!pricePoint) continue;
    const ci = calcCI(pricePoint.price, pricePoint.quality, yieldPerHa, hectares, totalCost, farmgateDiscount);
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

  // Score each sell window: penalise uncertain quality tiers and anomalous spikes.
  const scoreResult = r => {
    const tier = QUALITY_TIERS[r.quality] || QUALITY_TIERS.MED;
    // 0.85 anomaly penalty: deprioritises spike months by 15% in best-month
    // selection. Spikes are real but unreliable — farmers can't plan around them.
    const ANOMALY_SCORE_PENALTY = 0.85;
    return r.profit * tier.score * (r.isAnomaly ? ANOMALY_SCORE_PENALTY : 1);
  };
  const best  = results.reduce((a, b) => scoreResult(a) > scoreResult(b) ? a : b);
  const worst = results.reduce((a, b) => a.profit < b.profit ? a : b);

  const calcToday  = today || new Date();
  const advisor    = findOptimalPlantingWindow(crop, calcToday.getFullYear(), calcToday.getMonth() + 1);
  const percentDiff = worst.profit !== 0
    ? Math.round(((best.profit - worst.profit) / Math.abs(worst.profit)) * 100)
    : null;

  return {
    results, best, worst, totalCost, farmgateDiscount, advisor, percentDiff,
    coversCosts:          best.profitLow >= 0,
    storageWeeksIgnored:  (storageWeeks || 0) > 0 && storageMonths === 0,
    singlePoint:          results.length === 1,
    hasProjectedBest:     best.quality === "EST" || best.quality === "PROJ",
    hasAnomalousBest:     best.isAnomaly,
    bestProfitHasLossRisk: best.profitLow < 0,
    totalYieldKg:         best.totalYieldKg,
    yieldPerHa,
    hectares,
  };
}

// ─── FERTILIZER HELPER ────────────────────────────────────────────────────────
function estimateFertPrice(year, month) {
  const tgt = year * 12 + month;
  const pts = FERT_PRICE_HISTORY.map(p => ({ idx: p.yr * 12 + p.mo, price: p.price }));
  if (tgt <= pts[0].idx) return pts[0].price;
  if (tgt >= pts[pts.length - 1].idx) {
    const last = pts[pts.length - 1], prev = pts[pts.length - 2];
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

function calcFertSuggestion(crop, hectares, plantYear, plantMonth) {
  const rec = FERT_REC[crop];
  if (!rec || !hectares) return null;
  const totalKg    = rec.kgPerHa * hectares;
  const bags       = Math.ceil(totalKg / 50);
  const pricePerBag = estimateFertPrice(plantYear, plantMonth);
  const totalCost  = bags * pricePerBag;
  const splitSchedule = rec.splits.map(s => ({
    ...s,
    bags: Math.ceil(bags * s.fraction),
    cost: Math.round(totalCost * s.fraction),
  }));
  return { bags, totalCost, pricePerBag, splitSchedule, type: rec.type, note: rec.note };
}

// ─── URL STATE ────────────────────────────────────────────────────────────────
const URL_KEYS = ["crop","plantYear","plantMonth","hectares","areaUnit",
                  "seedCost","maintenanceCost","labourCost","otherCost",
                  "storageWeeks","yieldLocalUnit","yieldLocalCount"];

function encodeState(s) {
  const p = new URLSearchParams();
  URL_KEYS.forEach(k => p.set(k, s[k]));
  return p.toString();
}

function decodeState(search) {
  const p = new URLSearchParams(search);
  if (!URL_KEYS.every(k => p.has(k))) return { ok: false, reason: "missing_keys" };
  const out = {};
  for (const k of URL_KEYS) {
    out[k] = ["crop", "areaUnit"].includes(k) ? p.get(k) : Number(p.get(k));
  }
  if (!VALID_CROPS.has(out.crop))   return { ok: false, reason: "invalid_crop" };
  if (!AREA_UNITS[out.areaUnit])    return { ok: false, reason: "invalid_unit" };
  if (out.hectares <= 0 || out.hectares > 20)           return { ok: false, reason: "invalid_hectares" };
  // Cost fields: 0 is valid (farmer may own seeds), cap at ₦5M per category to reject injected values
  const MAX_COST = 5_000_000;
  if (out.seedCost        < 0 || out.seedCost        > MAX_COST) return { ok: false, reason: "invalid_cost" };
  if (out.maintenanceCost < 0 || out.maintenanceCost > MAX_COST) return { ok: false, reason: "invalid_cost" };
  if (out.labourCost      < 0 || out.labourCost      > MAX_COST) return { ok: false, reason: "invalid_cost" };
  if (out.otherCost       < 0 || out.otherCost       > MAX_COST) return { ok: false, reason: "invalid_cost" };
  // Yield and storage: must be positive finite numbers within plausible ranges
  if (!Number.isFinite(out.yieldLocalCount) || out.yieldLocalCount < 0 || out.yieldLocalCount > 100000)
    return { ok: false, reason: "invalid_yield" };
  if (!Number.isFinite(out.storageWeeks) || out.storageWeeks < 0 || out.storageWeeks > 52)
    return { ok: false, reason: "invalid_storage" };
  // Final guard: reject any remaining NaN/Infinity in numeric fields
  const numericKeys = URL_KEYS.filter(k => !["crop", "areaUnit"].includes(k));
  if (numericKeys.some(k => !Number.isFinite(out[k]))) return { ok: false, reason: "invalid_number" };
  return { ok: true, state: out };
}

// ─── FORMATTING ───────────────────────────────────────────────────────────────
function fmt(n) {
  if (n === null || n === undefined) return "—";
  if (Math.abs(n) >= 1e6) return `₦${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `₦${(n / 1e3).toFixed(1)}K`;
  return `₦${n.toFixed(0)}`;
}
function fmtPrice(n) { return `₦${Number(n).toFixed(0)}/kg`; }

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// All colours and recurring values in one place. Edit here, reflected everywhere.
function getTokens(theme) {
  const dark = theme === "dark";
  return {
    bg:          dark ? "#111713"                    : "#f4f1eb",
    bgCard:      dark ? "rgba(255,255,255,0.04)"     : "rgba(0,0,0,0.04)",
    bgCardDark:  dark ? "rgba(255,255,255,0.07)"     : "rgba(0,0,0,0.06)",
    bgCost:      dark ? "rgba(180,120,60,0.06)"      : "rgba(160,100,20,0.07)",
    border:      dark ? "#222e23"                    : "#d4cbb8",
    borderMid:   dark ? "#2e3f2f"                    : "#c0b49a",
    borderCost:  dark ? "#3a2a18"                    : "#c8a870",
    text:        dark ? "#edf0e8"                    : "#1a1a12",
    textMid:     dark ? "#9db89e"                    : "#4a4535",
    textDim:     dark ? "#637a65"                    : "#7a6e56",
    textFaint:   dark ? "#445546"                    : "#9e9278",
    amber:       dark ? "#E8A020"                    : "#9a6800",
    green:       dark ? "#74b87a"                    : "#2a6b30",
    red:         dark ? "#e07b7b"                    : "#b03030",
    redBg:       dark ? "rgba(160,50,50,0.08)"       : "rgba(176,48,48,0.07)",
    redBorder:   dark ? "rgba(200,100,100,0.22)"     : "rgba(176,48,48,0.25)",
    amberBg:     dark ? "rgba(232,160,32,0.08)"      : "rgba(154,104,0,0.08)",
    amberBorder: dark ? "rgba(232,160,32,0.22)"      : "rgba(154,104,0,0.25)",
    fontSerif:   "'Crimson Pro', Georgia, serif",
    fontMono:    "'DM Mono', 'Courier New', monospace",
    fontSans:    "'Inter', system-ui, sans-serif",
    bgSubtle:    dark ? "rgba(255,255,255,0.04)"     : "rgba(0,0,0,0.04)",
    bgInput:     dark ? "rgba(255,255,255,0.06)"     : "rgba(0,0,0,0.08)",
    bgUnitSel:   dark ? "rgba(232,160,32,0.18)"      : "rgba(154,104,0,0.15)",
    bgGradient:  dark ? "rgba(20,50,20,0.18)"        : "rgba(60,120,60,0.08)",
    bgGradient2: dark ? "rgba(120,70,30,0.10)"       : "rgba(160,100,30,0.06)",
    headerBg:    dark ? "rgba(17,23,19,0.94)"        : "rgba(244,241,235,0.94)",
    tableRowAlt: dark ? "rgba(255,255,255,0.03)"     : "rgba(0,0,0,0.03)",
  };
}

// ─── COST FIELD TIPS ─────────────────────────────────────────────────────────
// Plain-language explanations shown under each cost input label.
const COST_TIPS = {
  "Nursery Preparation": {
    short: "Nursery prep, seeds, cuttings, or seedlings — everything before transplanting.",
    detail: "Cassava → stems/cuttings · Maize → certified seeds · Yam → seed yams (setts) · Plantain → suckers · Tomato → nursery transplants/beds. Enter your actual agro-dealer spend, not a per-hectare estimate.",
  },
  "Farm Inputs": {
    short: "All farm inputs: pesticides, herbicides, fungicides, fertiliser top-ups, irrigation.",
    detail: "Includes everything you buy to keep the crop alive after planting: weedkillers, insecticides, fungicide sprays, and fuel for irrigation if you use it. Labour to apply them goes under Labour.",
  },
  "Labour": {
    short: "Wages paid for land prep, planting, weeding, and harvest.",
    detail: "Count every hired hand: land clearing, ridge/mound making, planting, multiple weeding rounds, and harvest labour. If you or family work unpaid, you can still include an opportunity cost here.",
  },
  "Other": {
    short: "Transport to market, bags/crates, storage, and anything else.",
    detail: "Common items: truck hire to the market, jute bags or tomato crates, cold store fees if applicable, levies at the market gate. If it costs money and doesn't fit above, put it here.",
  },
};

// ─── MODULE-LEVEL TOKEN REFERENCE ─────────────────────────────────────────────
// Sub-components (QualityDot, AlertBanner, etc.) are defined at module scope but
// need access to the current theme tokens. This mutable ref is updated at the
// top of every CropCompass render before any sub-component executes.
// It is intentionally NOT a React state variable — it's a synchronous render-time
// side-channel so child components don't need T threaded through as props.
let T = getTokens("dark");

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
function QualityDot({ q }) {
  return (
    <span aria-hidden="true" style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: QUALITY_TIERS[q]?.color || "#888",
      marginRight: 4, verticalAlign: "middle", flexShrink: 0,
    }} />
  );
}

function AlertBanner({ variant = "amber", style: extraStyle, children }) {
  const styles = {
    amber: { bg: T.amberBg,  border: T.amberBorder, color: T.amber },
    red:   { bg: T.redBg,    border: T.redBorder,   color: T.red     },
    green: { bg: T.bgCard,   border: T.border,       color: T.textMid },
  };
  const s = styles[variant] || styles.amber;
  return (
    <div role="alert" style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 10, padding: "10px 14px",
      fontSize: 12, color: s.color, lineHeight: 1.5,
      ...extraStyle,
    }}>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background: T.bgCard, border: `1px solid ${T.borderMid}`,
      borderRadius: 8, padding: "10px 14px", fontSize: 13, color: T.text, minWidth: 180,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: T.amber }}>{label}</div>
      {d && (
        <>
          <div><QualityDot q={d.quality} />{fmtPrice(d.price)}</div>
          <div style={{ color: T.textMid, fontSize: 11, marginTop: 2 }}>
            Likely range: {fmtPrice(d.priceConfLow)} – {fmtPrice(d.priceConfHigh)}
          </div>
          <div style={{ color: T.green, marginTop: 6 }}>Profit (mid): {fmt(d.profit)}</div>
          <div style={{ color: T.textMid, fontSize: 11 }}>
            Range: {fmt(d.profitLow)} – {fmt(d.profitHigh)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── CostInput ─────────────────────────────────────────────────────────────────
// Stores and displays a per-hectare rate. Shows the total (rate × hectares) live.
// Seeds and pesticides are sold in fixed-unit packages at Nigerian agro-markets.
// Treat the default as a starting point and override it with your actual spend.
function CostInput({ label, hint, valuePerHa, onChange, max = 500000, step = 5000, hectares }) {
  const totalVal = Math.round(valuePerHa * hectares);
  const maxTotal = Math.round(max * hectares);
  const stepTotal = Math.max(step, Math.round(step * hectares));
  const [rawTotal, setRawTotal] = useState(String(totalVal));
  const [tipOpen, setTipOpen] = useState(false);

  const tip = COST_TIPS[label];

  useEffect(() => {
    setRawTotal(String(Math.round(valuePerHa * hectares)));
  }, [valuePerHa, hectares]);

  function commitTotal(v) {
    const total = Math.round(Math.max(0, Math.min(maxTotal, Number(v) || 0)) / step) * step;
    const perHa = hectares > 0 ? total / hectares : 0;
    onChange(perHa);
    setRawTotal(String(Math.round(perHa * hectares)));
  }

  const inputId = `cost-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label htmlFor={inputId} style={{ fontSize: 13, color: T.textMid, fontFamily: T.fontSerif }}>
            {label}
          </label>
          {tip && (
            <button
              onClick={() => setTipOpen(x => !x)}
              aria-label={`${tipOpen ? "Hide" : "Show"} info for ${label}`}
              style={{
                background: "none", border: `1px solid ${T.border}`, borderRadius: "50%",
                width: 16, height: 16, fontSize: 9, color: T.textDim, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0, lineHeight: 1, flexShrink: 0,
              }}
            >?</button>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: T.textDim }}>₦</span>
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            value={rawTotal}
            aria-label={`${label} total cost`}
            onChange={e => setRawTotal(e.target.value)}
            onBlur={e => commitTotal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && commitTotal(rawTotal)}
            style={{
              width: 90, background: T.bgInput, border: `1px solid ${T.borderMid}`,
              borderRadius: 6, padding: "3px 6px", color: T.amber,
              fontSize: 12, fontFamily: T.fontMono, textAlign: "right",
            }}
          />
        </div>
      </div>
      {/* Short description always visible */}
      {tip && (
        <div style={{ fontSize: 11, color: T.textDim, marginBottom: tipOpen ? 4 : 6, lineHeight: 1.4 }}>
          {tip.short}
        </div>
      )}
      {/* Expandable detail */}
      {tip && tipOpen && (
        <div style={{
          fontSize: 11, color: T.textFaint, lineHeight: 1.5,
          background: T.bgSubtle, border: `1px solid ${T.border}`,
          borderRadius: 6, padding: "8px 10px", marginBottom: 6,
        }}>
          {tip.detail}
        </div>
      )}
      {hint && <div style={{ fontSize: 11, color: T.textDim, marginBottom: 4 }}>{hint}</div>}
      <input
        type="range"
        min={0}
        max={maxTotal}
        step={stepTotal}
        value={totalVal}
        aria-label={`${label} slider`}
        onChange={e => {
          const total = Number(e.target.value);
          const perHa = hectares > 0 ? total / hectares : 0;
          onChange(perHa);
          setRawTotal(String(Math.round(total)));
        }}
        style={{ width: "100%", accentColor: T.amber, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textFaint, marginTop: 2 }}>
        <span>₦0</span>
        <span style={{ color: T.textDim, fontWeight: 400 }}>
          {hectares > 0 ? `₦${Math.round(valuePerHa).toLocaleString()}/ha` : ""}
        </span>
      </div>
    </div>
  );
}

// ─── FarmSizeInput ─────────────────────────────────────────────────────────────
// Unit switcher (plots / acres / ha). Stored internally as hectares throughout.
function FarmSizeInput({ hectares, onChange }) {
  const [unit, setUnit] = useState("hectares");
  const u = AREA_UNITS[unit];
  const displayVal = parseFloat((hectares / u.toHa).toFixed(unit === "hectares" ? 3 : 2));
  const [rawStr, setRawStr] = useState(String(displayVal));

  useEffect(() => {
    setRawStr(String(parseFloat((hectares / u.toHa).toFixed(unit === "hectares" ? 3 : 2))));
  }, [hectares, unit]); // eslint-disable-line react-hooks/exhaustive-deps
  // ^ Intentionally omits `u` from deps — `u` is derived from `unit` which is included.

  function commitFromDisplay(v) {
    const n = parseFloat(v);
    if (!isNaN(n) && n > 0) onChange(Math.max(0.023, Math.min(20, n * u.toHa)));
  }

  const minDisplay = parseFloat((0.023 / u.toHa).toFixed(2));
  const maxDisplay = parseFloat((20 / u.toHa).toFixed(2));
  const sliderStep = unit === "plots" ? 0.5 : unit === "acres" ? 0.1 : 0.023;

  function displayLabel() {
    const plots = hectares / AREA_UNITS.plots.toHa;
    const acres = hectares / AREA_UNITS.acres.toHa;
    if (unit === "plots")    return `${plots.toFixed(1)} plots (${hectares.toFixed(3)} ha)`;
    if (unit === "acres")    return `${acres.toFixed(2)} acres (${hectares.toFixed(3)} ha)`;
    return `${hectares.toFixed(3)} ha`;
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label style={{ fontSize: 13, color: T.textMid, fontFamily: T.fontSerif }}>Farm Size</label>
        <div role="group" aria-label="Area unit" style={{ display: "flex", gap: 4 }}>
          {Object.keys(AREA_UNITS).map(k => (
            <button
              key={k}
              onClick={() => setUnit(k)}
              aria-pressed={unit === k}
              style={{
                padding: "2px 8px", fontSize: 10, borderRadius: 4, cursor: "pointer",
                background: unit === k ? T.amber : T.bgUnitSel,
                color: unit === k ? T.bg : T.textMid,
                border: unit === k ? "none" : `1px solid ${T.borderMid}`,
                fontWeight: unit === k ? 700 : 400,
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
        <input
          type="text"
          inputMode="decimal"
          value={rawStr}
          aria-label={`Farm size in ${unit}`}
          onChange={e => setRawStr(e.target.value)}
          onBlur={e => commitFromDisplay(e.target.value)}
          onKeyDown={e => e.key === "Enter" && commitFromDisplay(rawStr)}
          style={{
            width: 80, background: T.bgInput, border: `1px solid ${T.borderMid}`,
            borderRadius: 6, padding: "4px 8px", color: T.amber,
            fontSize: 13, fontFamily: T.fontMono, textAlign: "right",
          }}
        />
        <span style={{ fontSize: 12, color: T.textDim }}>{u.symbol}</span>
      </div>
      <div style={{ fontSize: 11, color: T.textFaint, marginBottom: 4 }}>{displayLabel()}</div>
      <input
        type="range"
        min={minDisplay}
        max={maxDisplay}
        step={sliderStep}
        value={displayVal}
        aria-label="Farm size slider"
        onChange={e => { commitFromDisplay(e.target.value); setRawStr(String(e.target.value)); }}
        style={{ width: "100%", accentColor: T.amber, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textFaint, marginTop: 2 }}>
        <span>½ plot</span><span>20 ha</span>
      </div>
    </div>
  );
}

// ─── YieldInput ────────────────────────────────────────────────────────────────
// Farmer enters yield as a local count (baskets, bags, etc.) per their whole farm.
// t/ha = (count × unitRatio) / hectares. Warns (but does not clamp) if outside
// the SW Nigeria typical range, so the farmer retains control.
function YieldInput({ crop, hectares, yieldPerHa, onChange }) {
  const units  = LOCAL_YIELD_UNITS[crop] || [{ label: "tonnes", ratio: 1, peakPerHa: 20 }];
  const [unitIdx, setUnitIdx] = useState(0);
  const u    = units[unitIdx];
  const meta = CROP_META[crop];

  const localCountFromYield = yieldPerHa * hectares / u.ratio;
  const [rawCount, setRawCount] = useState(String(Math.round(localCountFromYield)));

  // Sync display when unit or farm size changes — yieldPerHa is the stable state.
  useEffect(() => {
    setRawCount(String(Math.round(yieldPerHa * hectares / u.ratio)));
  }, [unitIdx, hectares]); // eslint-disable-line react-hooks/exhaustive-deps
  // ^ yieldPerHa intentionally excluded: only sync on unit/size change, not every keystroke.

  const isOutOfRange = yieldPerHa < meta.yieldRange.min || yieldPerHa > meta.yieldRange.max;

  function commitCount(v) {
    const count   = parseFloat(v) || 0;
    const tPerFarm = count * u.ratio;
    const tPerHa  = hectares > 0 ? tPerFarm / hectares : 0;
    // Warn but do not silently clamp — let the farmer see the number they entered.
    onChange(parseFloat(tPerHa.toFixed(2)));
    setRawCount(String(Math.round(tPerHa * hectares / u.ratio)));
  }

  const sliderMax = Math.round(u.peakPerHa * hectares);
  const sliderMin = Math.max(1, Math.round(meta.yieldRange.min * hectares / u.ratio));

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <label style={{ fontSize: 13, color: T.textMid, fontFamily: T.fontSerif }}>Expected Harvest</label>
        <input
          type="text"
          inputMode="decimal"
          value={rawCount}
          aria-label={`Expected harvest in ${u.label}`}
          onChange={e => setRawCount(e.target.value)}
          onBlur={e => commitCount(e.target.value)}
          onKeyDown={e => e.key === "Enter" && commitCount(rawCount)}
          style={{
            width: 72, background: T.bgInput, border: `1px solid ${T.borderMid}`,
            borderRadius: 6, padding: "3px 6px", color: T.amber,
            fontSize: 13, fontFamily: T.fontMono, textAlign: "right",
          }}
        />
      </div>
      <div role="group" aria-label="Yield unit" style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
        {units.map((uu, i) => (
          <button
            key={i}
            onClick={() => setUnitIdx(i)}
            aria-pressed={unitIdx === i}
            style={{
              padding: "2px 8px", fontSize: 10, borderRadius: 4, cursor: "pointer",
              background: unitIdx === i ? "rgba(249,168,37,0.2)" : "transparent",
              color: unitIdx === i ? T.amber : T.textDim,
              border: unitIdx === i ? "1px solid rgba(249,168,37,0.4)" : `1px solid ${T.border}`,
            }}
          >
            {uu.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: T.textFaint, marginBottom: 4 }}>
        ≈ {yieldPerHa.toFixed(1)} t/ha · SW Nigeria typical: {meta.yieldRange.min}–{meta.yieldRange.max} t/ha
      </div>
      {isOutOfRange && (
        <div role="alert" style={{ fontSize: 11, color: T.amber, marginBottom: 4, lineHeight: 1.4 }}>
          ⚠ This yield is outside the typical SW Nigeria range. Check the count is for your whole farm, not per hectare.
        </div>
      )}
      <input
        type="range"
        min={sliderMin}
        max={sliderMax}
        step={1}
        value={Math.min(Math.round(localCountFromYield), sliderMax)}
        aria-label="Expected harvest slider"
        onChange={e => commitCount(e.target.value)}
        style={{ width: "100%", accentColor: T.amber, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textFaint, marginTop: 2 }}>
        <span>{sliderMin} {u.label}</span>
        <span>{sliderMax} {u.label}</span>
      </div>
    </div>
  );
}

function SliderInput({ label, value, onChange, min, max, step = 1, format, hint }) {
  const inputId = `slider-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label htmlFor={inputId} style={{ fontSize: 13, color: T.textMid, fontFamily: T.fontSerif }}>{label}</label>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.amber }}>
          {format ? format(value) : value}
        </span>
      </div>
      {hint && <div style={{ fontSize: 11, color: T.textDim, marginBottom: 4 }}>{hint}</div>}
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: T.amber, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textFaint, marginTop: 2 }}>
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}

function FertPanel({ fertSuggestion, plantYear, plantMonth }) {
  const [expanded, setExpanded] = useState(false);
  if (!fertSuggestion) return null;
  return (
    <div style={{
      background: T.bgSubtle, border: `1px solid ${T.border}`,
      borderRadius: 10, marginBottom: 16, overflow: "hidden",
    }}>
      <button
        onClick={() => setExpanded(x => !x)}
        aria-expanded={expanded}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <div>
          <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>
            🌱 Fertilizer Guide
          </span>
          <span style={{ fontSize: 11, color: T.textDim, marginLeft: 8 }}>
            {fertSuggestion.bags} bags · {fmt(fertSuggestion.totalCost)} est.
          </span>
        </div>
        <span aria-hidden="true" style={{ fontSize: 11, color: T.textFaint }}>
          {expanded ? "▲ less" : "▼ details"}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${T.border}` }}>
          {/* Agronomic note first — most useful line for the farmer */}
          <div style={{
            fontSize: 12, color: T.amber, lineHeight: 1.5,
            margin: "10px 0 8px", fontWeight: 500,
          }}>
            {fertSuggestion.note}
          </div>
          <div style={{ fontSize: 11, color: T.green, marginBottom: 8 }}>
            {fertSuggestion.type}
          </div>
          <div style={{ marginBottom: 10 }}>
            {fertSuggestion.splitSchedule.map((s, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "6px 0",
                borderBottom: i < fertSuggestion.splitSchedule.length - 1 ? `1px solid ${T.border}` : "none",
              }}>
                <div>
                  <span style={{ fontSize: 12, color: T.textMid }}>Application {i + 1}</span>
                  <span style={{ fontSize: 11, color: T.textDim, marginLeft: 8 }}>{s.label}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 12, color: T.amber, fontFamily: T.fontMono }}>
                    {s.bags} bags
                  </span>
                  <span style={{ fontSize: 11, color: T.textFaint, marginLeft: 6 }}>{fmt(s.cost)}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: T.textFaint }}>
            Price est. for {MONTH_NAMES[plantMonth - 1]}-{plantYear} at ~{fmt(fertSuggestion.pricePerBag)}/bag · Verify locally — fertilizer prices are FX-driven.
          </div>
        </div>
      )}
    </div>
  );
}

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div role="alert" style={{
        padding: 24, border: `1px solid ${T.redBorder}`,
        borderRadius: 12, background: T.redBg, color: T.red, lineHeight: 1.5,
      }}>
        CropCompass could not render this result. Adjust the inputs and try again.
      </div>
    );
    return this.props.children;
  }
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function CropCompass() {
  const today    = new Date();
  const thisYear = today.getFullYear();
  const [theme, setTheme] = useState(() => {
    // Respect OS preference on first load
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    return "dark";
  });
  // Update the module-level T reference so all sub-components see current tokens.
  T = getTokens(theme);

  const [step, setStep] = useState(1);
  const [crop, setCrop] = useState(null);
  const [plantYear, setPlantYear] = useState(thisYear);
  const [plantMonth, setPlantMonth] = useState(today.getMonth() + 1);
  const [hectares, setHectares] = useState(1);
  const [yieldPerHa, setYieldPerHa] = useState(10);
  const [seedCostPerHa, setSeedCostPerHa] = useState(25000);
  const [maintenanceCostPerHa, setMaintenanceCostPerHa] = useState(12000);
  const [labourCostPerHa, setLabourCostPerHa] = useState(20000);
  const [otherCostPerHa, setOtherCostPerHa] = useState(8000);
  const [storageWeeks, setStorageWeeks] = useState(4);
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [calcStep, setCalcStep] = useState(0);
  const [copied, setCopied] = useState(false);
  // loadingPhrase is derived from calcStep — not a separate state variable
  const [shareFallbackUrl, setShareFallbackUrl] = useState("");
  const [shareLoadWarning, setShareLoadWarning] = useState(false);
  const [urlDecodeError, setUrlDecodeError] = useState("");

  const skipCropDefaultsRef = useRef(false);
  const calcTimerRef        = useRef(null);

  // ─── URL LOAD ON MOUNT ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!window.location.search) return;
    const decoded = decodeState(window.location.search);
    if (!decoded.ok) {
      setUrlDecodeError(`Could not load shared result (${decoded.reason}). Starting fresh.`);
      return;
    }
    const { crop: c, plantYear: py, plantMonth: pm, hectares: h,
      seedCost: sc, maintenanceCost: mc, labourCost: lc, otherCost: oc,
      storageWeeks: sw, yieldLocalUnit: ylu, yieldLocalCount: ylc } = decoded.state;

    skipCropDefaultsRef.current = true;
    setShareLoadWarning(true);
    setCrop(c); setPlantYear(py); setPlantMonth(pm); setHectares(h); setStorageWeeks(sw);
    const units   = LOCAL_YIELD_UNITS[c] || [{ ratio: 1 }];
    const unitIdx = Math.min(ylu, units.length - 1);
    const tPerHa  = h > 0 ? (ylc * units[unitIdx].ratio) / h : 10;
    setYieldPerHa(parseFloat(tPerHa.toFixed(2)));
    setSeedCostPerHa(sc); setMaintenanceCostPerHa(mc);
    setLabourCostPerHa(lc); setOtherCostPerHa(oc);
    triggerCalc({
      crop: c, plantYear: py, plantMonth: pm, hectares: h,
      seedCost: sc * h, maintenanceCost: mc * h, labourCost: lc * h, otherCost: oc * h,
      yieldPerHa: tPerHa, storageWeeks: sw,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ^ triggerCalc is defined below with useCallback; this effect runs once on mount only.

  // ─── CROP CHANGE — reset defaults ──────────────────────────────────────────
  useEffect(() => {
    if (!crop) return;
    if (skipCropDefaultsRef.current) { skipCropDefaultsRef.current = false; return; }
    const m = CROP_META[crop];
    setSeedCostPerHa(m.seedCostHintPerHa);
    setMaintenanceCostPerHa(m.maintenanceCostHintPerHa);
    setLabourCostPerHa(m.labourCostHintPerHa);
    setOtherCostPerHa(m.otherCostHintPerHa);
    setYieldPerHa(m.defaultYield);
    setResult(null);
  }, [crop]);

  useEffect(() => () => { if (calcTimerRef.current) clearInterval(calcTimerRef.current); }, []);

  // ─── CALCULATE ─────────────────────────────────────────────────────────────
  // The calculation itself is synchronous. The animated loading sequence is
  // intentional UX — 600ms gives the user a moment to read the loading phrases
  // before results appear. Implemented with an interval to step through dots.
  const triggerCalc = useCallback((overrides) => {
    const inputs = overrides || {
      crop, plantYear, plantMonth, hectares, yieldPerHa, storageWeeks,
      seedCost:        seedCostPerHa * hectares,
      maintenanceCost: maintenanceCostPerHa * hectares,
      labourCost:      labourCostPerHa * hectares,
      otherCost:       otherCostPerHa * hectares,
    };
    setCalculating(true); setCalcStep(0);
    setShareFallbackUrl("");
    if (!overrides) setShareLoadWarning(false);
    setStep(3);
    if (calcTimerRef.current) clearInterval(calcTimerRef.current);
    const r = runCalculation({ ...inputs, today });
    let i = 0;
    calcTimerRef.current = setInterval(() => {
      i++;
      setCalcStep(i);
      if (i >= 2) {
        clearInterval(calcTimerRef.current);
        calcTimerRef.current = null;
        setResult(r);
        setCalculating(false);
      }
    }, 300);
  }, [crop, plantYear, plantMonth, hectares, yieldPerHa,
      seedCostPerHa, maintenanceCostPerHa, labourCostPerHa, otherCostPerHa,
      storageWeeks, today]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleShare() {
    const units = LOCAL_YIELD_UNITS[crop] || [{ ratio: 1 }];
    const ylu   = 0;
    const ylc   = Math.round(yieldPerHa * hectares / units[ylu].ratio);
    const state = {
      crop, plantYear, plantMonth, hectares, areaUnit: "hectares",
      seedCost: seedCostPerHa, maintenanceCost: maintenanceCostPerHa,
      labourCost: labourCostPerHa, otherCost: otherCostPerHa,
      storageWeeks, yieldLocalUnit: ylu, yieldLocalCount: ylc,
    };
    const url = `${window.location.origin}${window.location.pathname}?${encodeState(state)}`;
    if (!navigator.clipboard?.writeText) { setShareFallbackUrl(url); return; }
    navigator.clipboard.writeText(url)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); })
      .catch(() => setShareFallbackUrl(url));
  }

  const meta           = crop ? CROP_META[crop] : null;
  const totalCostPerHa = seedCostPerHa + maintenanceCostPerHa + labourCostPerHa + otherCostPerHa;
  const totalCost      = totalCostPerHa * hectares;
  const fertSuggestion = (crop && hectares) ? calcFertSuggestion(crop, hectares, plantYear, plantMonth) : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      backgroundImage: `
        radial-gradient(ellipse at 20% 20%, ${T.bgGradient} 0%, transparent 60%),
        radial-gradient(ellipse at 80% 80%, ${T.bgGradient2} 0%, transparent 60%)
      `,
      fontFamily: T.fontSans,
      color: T.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=range] { height: 4px; border-radius: 2px; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${theme === "dark" ? "#111713" : "#e8e3d8"}; }
        ::-webkit-scrollbar-thumb { background: ${theme === "dark" ? "#2d4a2d" : "#b0a88e"}; border-radius: 3px; }
        .crop-card { transition: transform 0.2s ease, border-color 0.2s ease; cursor: pointer; }
        .crop-card:hover { transform: translateY(-2px); }
        .crop-card:focus-visible { outline: 2px solid ${T.amber}; outline-offset: 3px; border-radius: 12px; }
        .btn-primary { transition: background 0.2s ease, transform 0.15s ease; }
        .btn-primary:hover { background: ${theme === "dark" ? "#c88a18" : "#7a5200"} !important; transform: translateY(-1px); }
        .btn-primary:focus-visible { outline: 2px solid ${T.amber}; outline-offset: 3px; }
        .btn-ghost { transition: background 0.2s ease; cursor: pointer; }
        .btn-ghost:hover { background: ${T.amberBg} !important; }
        .btn-ghost:focus-visible { outline: 2px solid ${T.amber}; outline-offset: 3px; }
        button:focus-visible { outline: 2px solid ${T.amber}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .crop-card, .btn-primary, .btn-ghost { transition: none !important; }
        }
        @media (max-width: 480px) {
          main { padding: 16px 12px 48px !important; }
          header { padding: 12px 14px !important; }
          footer { padding: 14px 12px !important; }
          h1 { font-size: 28px !important; }
        }
      `}</style>

      {/* ─── HEADER ─── */}
      <header style={{
        borderBottom: `1px solid ${T.border}`, padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 100,
        background: T.headerBg,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div aria-hidden="true" style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #1B5E20, #F9A825)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>🧭</div>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px", lineHeight: 1 }}>
              CropCompass
            </div>
            <div style={{ fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Ogun State · SW Nigeria · Phase 1
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, color: T.textFaint, textAlign: "right", marginRight: 4 }}>
            <div>NBS Price Data</div>
            <div>May 2023 – Mar 2026</div>
          </div>
          <button
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="btn-ghost"
            style={{
              fontSize: 15, padding: "6px 9px", background: "none",
              border: `1px solid ${T.border}`, borderRadius: 6,
              color: T.textMid, cursor: "pointer", lineHeight: 1, flexShrink: 0,
            }}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(16px, 4vw, 32px) clamp(12px, 4vw, 24px) 64px" }}>
        <ErrorBoundary>
          <>
            {/* URL decode error — shown at top before step content */}
            {urlDecodeError && (
              <div style={{ marginBottom: 20 }}>
                <AlertBanner variant="amber">{urlDecodeError}</AlertBanner>
              </div>
            )}

            {/* ─── STEP 1: Hero + crop selection ─── */}
            {step === 1 && (
              <>
                <div style={{ marginBottom: 32, textAlign: "center" }}>
                <h1 style={{
                  fontFamily: T.fontSerif, fontSize: "clamp(28px, 5vw, 44px)",
                  fontWeight: 300, lineHeight: 1.1, marginBottom: 8, letterSpacing: "-0.5px",
                }}>
                  When should you sell<br />
                  <em style={{ fontStyle: "italic", color: T.amber }}>to maximise your profit?</em>
                </h1>
                <p style={{ color: T.textDim, fontSize: 14, maxWidth: 480, margin: "0 auto" }}>
                  Based on historical SW Nigeria price patterns. Select your crop to begin.
                </p>
              </div>

              {/* Crop selection */}
              <div
                role="list"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12, marginBottom: 32,
                }}
              >
              {Object.entries(CROP_META).map(([name, m]) => (
                <div
                  key={name}
                  role="listitem"
                  className="crop-card"
                  tabIndex={0}
                  aria-label={`Select ${name}, ${m.growthMonths.min}–${m.growthMonths.max} months to harvest`}
                  onClick={() => { setCrop(name); setStep(2); }}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCrop(name); setStep(2); } }}
                  style={{
                    background: crop === name ? "rgba(249,168,37,0.08)" : T.bgCard,
                    border: `1px solid ${crop === name ? T.amber : T.border}`,
                    borderRadius: 12, padding: "16px 12px", textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }} aria-hidden="true">{m.emoji}</div>
                  <div style={{
                    fontFamily: T.fontSerif, fontSize: 16, fontWeight: 600,
                    color: crop === name ? T.amber : T.text,
                  }}>
                    {name}
                  </div>
                  <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>
                    {m.growthMonths.min}–{m.growthMonths.max} mo
                  </div>
                </div>
              ))}
            </div>
            </>
            )}

            {/* ─── STEP 2 INPUTS ─── */}
            {step === 2 && crop && (
              <>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: T.textDim, fontSize: 11, marginBottom: 24,
                  }}
                >
                  ← Change crop
                </button>
                <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 400, marginBottom: 8 }}>
                  {meta.emoji} Farm Details
                </h2>
                <p style={{ color: T.textMid, fontSize: 13 }}>
                  Adjust your farm size, expected yield, and input costs.
                </p>
              </div>

              <div style={{ 
                background: T.bgCard, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: "20px 16px", marginBottom: 32,
              }}>
                <FarmSizeInput hectares={hectares} onChange={setHectares} />
                <YieldInput crop={crop} hectares={hectares} yieldPerHa={yieldPerHa} onChange={setYieldPerHa} />

                {/* Growth month and storage hints */}
                <div style={{
                  background: T.bgSubtle, borderRadius: 8, padding: "10px 12px",
                  fontSize: 11, color: T.textDim, marginBottom: 20,
                }}>
                  <div>• {meta.emoji} will need {meta.growthMonths.min}–{meta.growthMonths.max} months to harvest.</div>
                  <div>• Storage (below) extends your sell window only if you can store without spoilage.</div>
                </div>

                <SliderInput
                  label="Storage (weeks)"
                  value={storageWeeks}
                  onChange={setStorageWeeks}
                  min={0}
                  max={26}
                  format={v => v === 0 ? "No storage" : `${v} weeks`}
                  hint="After harvest, how long can you store without significant loss?"
                />
              </div>

              {/* Planting date and costs */}
              <div style={{ 
                background: T.bgCard, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: "20px 16px", marginBottom: 32,
              }}>
                <h3 style={{ fontFamily: T.fontSerif, fontSize: 16, marginBottom: 12, color: T.text }}>
                  Planting Date & Costs
                </h3>
                <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="plant-month" style={{ fontSize: 12, color: T.textMid }}>Month</label>
                    <select
                      id="plant-month"
                      value={plantMonth}
                      onChange={e => setPlantMonth(Number(e.target.value))}
                      style={{
                        width: "100%", padding: "6px 8px", marginTop: 4,
                        background: T.bgInput, border: `1px solid ${T.borderMid}`,
                        borderRadius: 6, color: T.amber, fontSize: 12,
                      }}
                    >
                      {FULL_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="plant-year" style={{ fontSize: 12, color: T.textMid }}>Year</label>
                    <select
                      id="plant-year"
                      value={plantYear}
                      onChange={e => setPlantYear(Number(e.target.value))}
                      style={{
                        width: "100%", padding: "6px 8px", marginTop: 4,
                        background: T.bgInput, border: `1px solid ${T.borderMid}`,
                        borderRadius: 6, color: T.amber, fontSize: 12,
                      }}
                    >
                      {[thisYear, thisYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {meta.note && (
                  <div style={{
                    fontSize: 11, color: T.textDim, background: T.bgSubtle,
                    border: `1px solid ${T.border}`, borderRadius: 8,
                    padding: "8px 12px", marginBottom: 16, lineHeight: 1.5,
                  }}>
                    💡 {meta.note}
                  </div>
                )}

                <CostInput label="Nursery Preparation" valuePerHa={seedCostPerHa} onChange={setSeedCostPerHa} hectares={hectares} />
                <CostInput label="Farm Inputs" valuePerHa={maintenanceCostPerHa} onChange={setMaintenanceCostPerHa} hectares={hectares} />
                <CostInput label="Labour" valuePerHa={labourCostPerHa} onChange={setLabourCostPerHa} hectares={hectares} />
                <CostInput label="Other" valuePerHa={otherCostPerHa} onChange={setOtherCostPerHa} hectares={hectares} />

                <div style={{
                  background: T.bgCost, border: `1px solid ${T.borderCost}`,
                  borderRadius: 8, padding: "14px 16px", marginTop: 12,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: T.textMid, fontWeight: 600 }}>Total spend to plant</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: T.amber, fontFamily: T.fontMono }}>
                      {fmt(totalCost)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textFaint }}>
                    <span>Seeds + maintenance + labour + other</span>
                    <span>₦{Math.round(totalCostPerHa).toLocaleString()}/ha</span>
                  </div>
                </div>

                <FertPanel fertSuggestion={fertSuggestion} plantYear={plantYear} plantMonth={plantMonth} />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1, padding: "12px", background: "none", border: `1px solid ${T.border}`,
                    borderRadius: 8, color: T.textMid, cursor: "pointer", fontSize: 13,
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => triggerCalc()}
                  disabled={calculating}
                  className="btn-primary"
                  style={{
                    flex: 2, padding: "12px", background: calculating ? T.textDim : T.amber, border: "none",
                    borderRadius: 8, color: T.bg, fontWeight: 600,
                    cursor: calculating ? "not-allowed" : "pointer", fontSize: 13,
                    opacity: calculating ? 0.7 : 1,
                  }}
                >
                  {calculating ? "Analysing…" : "Analyze"}
                </button>
              </div>
            </>
            )}

            {/* ─── STEP 3 RESULTS ─── */}
            {step === 3 && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <h2 style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 400 }}>
                    {crop && meta.emoji} Results
                  </h2>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: T.textDim, fontSize: 11,
                    }}
                  >
                    ← Edit inputs
                  </button>
                </div>

                {calculating && (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ fontSize: 14, color: T.textMid, marginBottom: 16 }}>
                      {LOADING_PHRASES[Math.min(calcStep, LOADING_PHRASES.length - 1)]}
                    </div>
                    <div style={{ fontSize: 24, color: T.amber, letterSpacing: "2px" }}>
                      {"⋯".repeat(Math.min(calcStep + 1, 3))}
                    </div>
                  </div>
                )}

                {!calculating && result && (
                  <>
                    {/* Share button & URL */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                      <button
                        onClick={handleShare}
                        className="btn-primary"
                        style={{
                          padding: "10px 14px", background: T.amber, color: T.bg,
                          border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
                        }}
                      >
                        {copied ? "✓ Copied!" : "Share"}
                      </button>
                      {shareFallbackUrl && (
                        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                          <input
                            type="text" readOnly value={shareFallbackUrl}
                            style={{
                              width: "100%", padding: "8px", fontSize: 11, color: T.textDim,
                              background: T.bgSubtle, border: `1px solid ${T.border}`,
                              borderRadius: 6,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {shareLoadWarning && (
                      <AlertBanner variant="amber">
                        ⚠ This is a shared result. Verify the inputs below are accurate before using this analysis.
                      </AlertBanner>
                    )}

                    {/* Summary card */}
                    {result.best && (
                      <AlertBanner variant="green" style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 13, marginBottom: 8 }}>
                          <strong>{crop}</strong> planted {MONTH_NAMES[plantMonth - 1]} {plantYear} — sell{" "}
                          <strong>{result.best.month}</strong> for a likely profit of <strong>{fmt(result.best.profitLow)}</strong> – <strong>{fmt(result.best.profitHigh)}</strong>.
                        </div>
                        {result.coversCosts && (
                          <div style={{ fontSize: 11 }}>✓ Even in a weaker season, this window should cover all input costs.</div>
                        )}
                        {result.bestProfitHasLossRisk && (
                          <div style={{ fontSize: 11 }}>⚠ In a worst-case scenario, there's a risk of loss. Budget contingency.</div>
                        )}
                        {result.percentDiff && (
                          <div style={{ fontSize: 11, marginTop: 6 }}>
                            Selling in {result.worst.month} instead would cut profit by ~{result.percentDiff}%.
                          </div>
                        )}
                      </AlertBanner>
                    )}

                    {/* Advisor card */}
                    {result.advisor && result.advisor.plantMonthName !== FULL_MONTHS[plantMonth - 1] && (
                      <AlertBanner variant="amber" style={{ marginBottom: 20 }}>
                        For the next planting cycle, <strong>planting in {result.advisor.plantMonthName}</strong> would put harvest into{" "}
                        <strong>{result.advisor.sellMonthName}</strong> ({result.advisor.sellLabel}) — historically one of the stronger sell windows for {crop} in SW Nigeria.
                      </AlertBanner>
                    )}

                    {/* Expected Yield summary */}
                    {result.totalYieldKg > 0 && (
                      <div style={{
                        background: T.bgCard, border: `1px solid ${T.border}`,
                        borderRadius: 12, padding: "14px 18px", marginBottom: 16,
                        display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center",
                      }}>
                        <div>
                          <div style={{ fontSize: 11, color: T.textDim, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
                            Expected Yield
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: T.fontMono }}>
                            {result.totalYieldKg >= 1000
                              ? `${(result.totalYieldKg / 1000).toFixed(2)} t`
                              : `${Math.round(result.totalYieldKg)} kg`}
                          </div>
                          <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>
                            {result.yieldPerHa.toFixed(1)} t/ha × {result.hectares.toFixed(2)} ha
                          </div>
                        </div>
                        <div style={{ width: 1, height: 40, background: T.border, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 11, color: T.textDim, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
                            Revenue Range (Best Month)
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 600, color: T.green, fontFamily: T.fontMono }}>
                            {fmt(result.best.revenue - (result.best.profit - result.best.profitLow))} – {fmt(result.best.revenue + (result.best.profitHigh - result.best.profit))}
                          </div>
                          <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>
                            Before deducting your ₦{Math.round(result.totalCost).toLocaleString()} costs
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Best & Worst cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
                      <div style={{
                        background: T.bgCard, border: `1px solid ${T.border}`,
                        borderRadius: 12, padding: "16px",
                      }}>
                        <div style={{ fontSize: 11, color: T.textDim, marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Best Month</div>
                        <div style={{ fontSize: 12, color: T.amber, marginBottom: 4 }}>
                          <QualityDot q={result.best.quality} />
                          {result.best.month}
                        </div>
                        {result.best.isAnomaly && <AlertBanner variant="amber" style={{ marginBottom: 8 }}>⚠ Anomalous spike — high risk</AlertBanner>}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: T.textMid, marginBottom: 2 }}>Profit range</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: T.green }}>
                            {fmt(result.best.profitLow)} – {fmt(result.best.profitHigh)}
                          </div>
                          <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
                            Mid-estimate: <strong style={{ color: T.amber }}>{fmt(result.best.profit)}</strong>
                          </div>
                        </div>
                        <div style={{ fontSize: 10, color: T.textFaint, lineHeight: 1.4 }}>
                          Market price: {fmtPrice(result.best.marketPrice)} → Farmgate: {fmtPrice(result.best.price)}
                        </div>
                      </div>

                      <div style={{
                        background: T.bgCard, border: `1px solid ${T.border}`,
                        borderRadius: 12, padding: "16px",
                      }}>
                        <div style={{ fontSize: 11, color: T.textDim, marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Worst Month</div>
                        <div style={{ fontSize: 12, color: T.amber, marginBottom: 12 }}>
                          <QualityDot q={result.worst.quality} />
                          {result.worst.month}
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: T.textMid, marginBottom: 2 }}>Profit range</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: result.worst.profit >= 0 ? T.green : T.red }}>
                            {fmt(result.worst.profitLow)} – {fmt(result.worst.profitHigh)}
                          </div>
                          <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
                            Mid-estimate: <strong style={{ color: result.worst.profit >= 0 ? T.amber : T.red }}>{fmt(result.worst.profit)}</strong>
                          </div>
                        </div>
                        <div style={{ fontSize: 10, color: T.textFaint, lineHeight: 1.4 }}>
                          Market price: {fmtPrice(result.worst.marketPrice)} → Farmgate: {fmtPrice(result.worst.price)}
                        </div>
                      </div>
                    </div>

                    {/* Chart */}
                    {result.results.length > 1 && (() => {
                      const chartData = result.results.map(r => ({
                        ...r,
                        profitBand: r.profitHigh - r.profitLow,
                        profitBase: r.profitLow,
                      }));
                      const allProfits = result.results.flatMap(r => [r.profitLow, r.profitHigh]);
                      const minY = Math.min(...allProfits, 0);
                      const maxY = Math.max(...allProfits);
                      const yPad = (maxY - minY) * 0.12;
                      return (
                      <div style={{
                        background: T.bgCard, border: `1px solid ${T.border}`,
                        borderRadius: 12, padding: 16, marginBottom: 24,
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: T.text }}>
                          Profit Across Your Sell Window
                        </div>
                        <div style={{ fontSize: 11, color: T.textDim, marginBottom: 12 }}>
                          Shaded band = best/worst case · Line = mid-estimate · Red dashes = break-even
                        </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={T.green} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={T.green} stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: T.textDim }} />
                        <YAxis
                          tick={{ fontSize: 10, fill: T.textDim }}
                          domain={[minY - yPad, maxY + yPad]}
                          tickFormatter={v => fmt(v)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={0} stroke={T.red} strokeDasharray="5 5"
                          label={{ value: "Break-even", position: "insideTopRight", fill: T.red, fontSize: 10 }} />
                        <Area type="monotone" dataKey="profitBase" stroke="none" fill="transparent" legendType="none" />
                        <Area type="monotone" dataKey="profitBand" stroke="none" fill="url(#profitGradient)" stackId="band" />
                        <Area type="monotone" dataKey="profit" stroke={T.green} strokeWidth={2} fill="none" dot={{ r: 3, fill: T.green }} activeDot={{ r: 5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                    </div>
                      );
                    })()}

                    {/* Breakdown table */}
                    <div style={{
                      background: T.bgCard, border: `1px solid ${T.border}`,
                      borderRadius: 12, overflow: "hidden", marginBottom: 24,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, padding: 16, color: T.text, borderBottom: `1px solid ${T.border}` }}>
                        Full Month-by-Month Breakdown
                      </div>
                      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: T.tableRowAlt, borderBottom: `1px solid ${T.border}` }}>
                            <th style={{ padding: "10px 12px", textAlign: "left", color: T.textMid, fontWeight: 500 }}>Month</th>
                            <th style={{ padding: "10px 12px", textAlign: "right", color: T.textMid, fontWeight: 500 }}>Price</th>
                            <th style={{ padding: "10px 12px", textAlign: "right", color: T.textMid, fontWeight: 500 }}>Profit Range</th>
                            <th style={{ padding: "10px 12px", textAlign: "right", color: T.textMid, fontWeight: 500 }}>Mid</th>
                            <th style={{ padding: "10px 12px", textAlign: "center", color: T.textMid, fontWeight: 500 }}>Quality</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.results.map((r, i) => (
                            <tr key={i} style={{ borderBottom: i < result.results.length - 1 ? `1px solid ${T.border}` : "none" }}>
                              <td style={{ padding: "10px 12px" }}>
                                <span style={{ color: T.amber, fontWeight: 500 }}>{r.month}</span>
                                {r.isHarvestWindow && <span style={{ color: T.textDim, fontSize: 10, marginLeft: 4 }}>harvest</span>}
                                {r.isStorageWindow && <span style={{ color: T.textDim, fontSize: 10, marginLeft: 4 }}>storage</span>}
                              </td>
                              <td style={{ padding: "10px 12px", textAlign: "right", color: T.green }}>{fmtPrice(r.marketPrice)}</td>
                              <td style={{ padding: "10px 12px", textAlign: "right", color: T.green }}>
                                {fmt(r.profitLow)} – {fmt(r.profitHigh)}
                              </td>
                              <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 500, color: r.profit >= 0 ? T.green : T.red }}>
                                {fmt(r.profit)}
                              </td>
                              <td style={{ padding: "10px 12px", textAlign: "center" }}>
                                <span style={{
                                  display: "inline-block",
                                  fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
                                  padding: "2px 6px", borderRadius: 4,
                                  background: (QUALITY_TIERS[r.quality]?.color || "#888") + "22",
                                  color: QUALITY_TIERS[r.quality]?.color || T.textDim,
                                  border: `1px solid ${(QUALITY_TIERS[r.quality]?.color || "#888")}44`,
                                }}>
                                  {r.quality || "—"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Data note */}
                    <div style={{ fontSize: 10, color: T.textFaint, lineHeight: 1.6, background: T.bgCardDark, padding: 12, borderRadius: 8 }}>
                      <strong style={{ color: T.textDim }}>About this analysis</strong>
                      <ul style={{ marginLeft: 16, marginTop: 6 }}>
                        <li>Prices are from NBS commodity market reports for SW Nigeria (May 2023 – Mar 2026).</li>
                        <li>Your farmgate price is estimated at {(result.farmgateDiscount * 100).toFixed(0)}% of the market price — the rest goes to traders and transport. This varies; negotiate if you can.</li>
                        <li>Profit ranges account for normal variation in yield and price. Actual results will differ.</li>
                        <li>Months after March 2026 are projections based on past seasonal patterns — treat them as a guide, not a guarantee.</li>
                      </ul>
                    </div>

                    <div style={{ textAlign: "center", marginTop: 32 }}>
                      <button
                        onClick={() => { setStep(2); setCopied(false); setShareFallbackUrl(""); }}
                        style={{
                          padding: "12px 24px", background: "none", border: `1px solid ${T.border}`,
                          borderRadius: 8, color: T.textMid, cursor: "pointer", fontSize: 13, fontWeight: 500,
                        }}
                      >
                        Adjust Inputs & Recalculate
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        </ErrorBoundary>
      </main>

      <footer style={{
        borderTop: `1px solid ${T.border}`, padding: "20px 24px", textAlign: "center",
        fontSize: 10, color: T.textFaint,
      }}>
        <div>CropCompass v1.3 · AgriProfit AI</div>
        <div style={{ marginTop: 6 }}>Built for Ogun State smallholders · NBS commodity price data</div>
      </footer>
    </div>
  );
}