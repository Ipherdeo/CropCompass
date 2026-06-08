# CropCompass

**Smarter harvest decisions for Nigerian smallholder farmers.**

CropCompass helps farmers in South-West Nigeria answer one question: *when should I sell my harvest to maximise profit?* It uses 35 months of NBS commodity price data to model sell-window profitability, accounting for yield uncertainty, price volatility, farmgate margins, and post-harvest storage — and shows results as a confidence interval range, not a single guess.

> Built as Phase 1 of the AgriProfit AI project.

---

## Live Demo

> Deployment coming soon (Vercel). Link will be added here.

---

## Features

- **Optimal sell-window analysis** — identifies the best and worst months to sell within your harvest and storage window
- **Profit confidence bands** — shows a realistic range (not a point estimate) using statistical error propagation
- **Expected yield display** — surfaces total expected yield in kg/tonnes alongside revenue and profit
- **Fertiliser advisor** — crop-specific NPK recommendations with application schedule and cost estimate
- **Optimal planting advisor** — if you haven't planted yet, recommends the planting month that targets the historically best sell window
- **URL share** — full farm configuration encoded in a shareable link; anyone opening it gets your exact inputs pre-loaded
- **Light / dark mode** — respects OS preference, toggleable in-app
- **Mobile-optimised** — responsive layout for field use on a phone

---

## Crops Supported

| Crop | Growth Window | Data Coverage |
|------|--------------|---------------|
| Cassava | 9–18 months | May 2023 – Mar 2026 |
| Maize | 3–4 months | May 2023 – Mar 2026 |
| Plantain | 9–12 months | May 2023 – Mar 2026 |
| Tomato | 3–4 months | May 2023 – Mar 2026 |
| Yam | 7–9 months | May 2023 – Mar 2026 |

Geographic coverage: **South-West Nigeria broadly** (NBS data does not disaggregate to individual state level at this tier).

---

## How the Model Works

### 1. Price Data & Quality Tiers
Each of the 175 price rows carries a quality rating that controls how wide the confidence interval is:

| Tier | Source | CI Width |
|------|--------|----------|
| HIGH | Direct SW zone NBS extraction | Narrowest |
| MED | National average / reverse-calculated | +15% |
| LOW | Seasonal trend estimate | +35% |
| EST | 2025–26 estimate (NBS not yet released) | +60% |
| PROJ | Algorithmic projection beyond dataset | +90% |

### 2. Confidence Interval Engine
Profit uncertainty is derived by propagating both price uncertainty and yield uncertainty through the revenue formula using standard error propagation:

```
Revenue = FarmgatePrice × TotalYield
Var(Revenue) ≈ Q²σP² + P²σQ² + σP²σQ²
```

- Price uncertainty: ±5% of farmgate price × quality tier multiplier
- Yield uncertainty: 15% coefficient of variation (calibrated to SW Nigeria smallholders)
- 95% CI uses z = 1.96

### 3. Seasonal Model + Trend Projection
A per-crop seasonal index (monthly average prices) is combined with an OLS trend slope to project prices beyond the dataset. The trend is dampened by 0.5× to prevent runaway extrapolation beyond 24 months.

### 4. Farmgate Discount
Farmers receive a fraction of the market price after trader/transport margins:

| Crop | Farmgate % |
|------|-----------|
| Cassava | 72% |
| Maize | 78% |
| Plantain | 75% |
| Tomato | 68% |
| Yam | 74% |

### 5. Anomaly Detection
Month-over-month price swings > 40% are flagged as anomalous. Anomalous months receive a 0.85× score penalty in best-window selection — they're real but not reliable to plan around.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Charts | Recharts |
| Styling | Inline design tokens (theme-aware) |
| State | React `useState` / `useCallback` |
| URL State | Custom encode/decode (URLSearchParams) |
| Deployment | Vercel (planned) |
| Data collection | Supabase (planned) |

No backend. No auth. No external API calls. Runs entirely in the browser.

---

## Getting Started

### Prerequisites
- Node.js 18+ ([nodejs.org](https://nodejs.org))

### Install & Run

```bash
git clone https://github.com/dayokage/cropcompass.git
cd cropcompass
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for Production

```bash
npm run build
# Output in /dist
```

---

## Project Structure

```
src/
├── CropCompass.tsx     # Main application (single-file, refactor in progress)
├── main.tsx            # React entry point
└── index.css           # Global resets
```

A multi-file restructure into `services/`, `components/`, `data/`, and `hooks/` is planned for Phase 2. The current architecture is a deliberate single-file prototype — the statistical model and domain logic are stable; the module boundaries are being drawn.

---

## Roadmap

### Phase 1 — Current
- [x] 5-crop pricing model with CI bands
- [x] Fertiliser advisor
- [x] URL share
- [x] Light/dark mode
- [x] Mobile layout

### Phase 2 — In Progress
- [ ] Vercel deployment
- [ ] Supabase data collection (usage analytics + actual vs predicted feedback loop)
- [ ] TypeScript migration
- [ ] Unit tests for price engine and CI calculation

### Phase 3 — Planned
- [ ] Real-time signals: rainfall alerts, fuel price, naira exchange rate
- [ ] State-level disaggregation (requires primary data or commodity exchange partnership)
- [ ] Crop expansion: cowpea, pepper, palm oil
- [ ] PWA / offline mode for low-connectivity field use
- [ ] CPI deflation for historical price accuracy

---

## Data Source

**National Bureau of Statistics (NBS)** — Nigeria commodity price reports, South-West zone.  
Coverage: May 2023 – March 2026 (35 months, 5 crops, 175 price points).  
Data is quality-tiered (HIGH/MED/LOW/EST) based on extraction confidence.  
Months beyond March 2026 are algorithmic projections until new NBS releases are incorporated.

---

## License

MIT

---

## Author

**Ifedayo Otegbola** ([@dayokage](https://github.com/dayokage))  
Statistics undergraduate, University of Ibadan · AgriProfit AI
