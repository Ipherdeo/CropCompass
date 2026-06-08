import AlertBanner from "../components/ui/AlertBanner";
import MonthTable from "../components/results/MonthTable";
import ProfitChart from "../components/results/ProfitChart";
import QualityDot from "../components/ui/QualityDot";
import { T } from "../styles/tokens";
import type { AppState, CalculationResult } from "../types/domain";
import { FULL_MONTHS, LOADING_PHRASES, MONTH_NAMES, PRICE_UNCERTAINTY_BASE, YIELD_UNCERTAINTY_CV } from "../utils/constants";
import { fmt, fmtPrice } from "../utils/format";

interface ResultsViewProps {
  state: AppState;
  result: CalculationResult | null;
  calculating: boolean;
  calcStep: number;
  loadingPhrase: number;
  shareLoadWarning: boolean;
  shareFallbackUrl: string;
  copied: boolean;
  onEdit: () => void;
  onShare: () => void;
  onClearShareFallback: () => void;
}

export default function ResultsView(props: ResultsViewProps) {
  const { state, result, calculating, calcStep, loadingPhrase, shareLoadWarning, shareFallbackUrl, copied, onEdit, onShare, onClearShareFallback } = props;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 400 }}>{state.crop} Results</h2>
        <button onClick={onEdit} style={{ background: "none", border: "none", cursor: "pointer", color: T.textDim, fontSize: 11 }}>Edit inputs</button>
      </div>
      {calculating && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 14, color: T.textMid, marginBottom: 16 }}>{LOADING_PHRASES[loadingPhrase]}</div>
          <div style={{ fontSize: 24, color: T.amber, letterSpacing: "2px" }}>{".".repeat(Math.min(calcStep + 1, 3))}</div>
        </div>
      )}
      {!calculating && result && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <button onClick={onShare} className="btn-primary" style={{ padding: "10px 14px", background: T.amber, color: "#0d1f0d", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              {copied ? "Copied" : "Share"}
            </button>
            {shareFallbackUrl && <input type="text" readOnly value={shareFallbackUrl} onFocus={onClearShareFallback} style={{ flex: 1, padding: "8px", fontSize: 11, color: T.textDim, background: "rgba(27,94,32,0.1)", border: `1px solid ${T.border}`, borderRadius: 6 }} />}
          </div>
          {shareLoadWarning && <AlertBanner variant="amber">This is a shared result. Verify the inputs before using this analysis.</AlertBanner>}
          <Summary result={result} state={state} />
          <ProfitChart result={result} />
          <MonthTable result={result} />
          <div style={{ fontSize: 10, color: T.textFaint, lineHeight: 1.6, background: T.bgCardDark, padding: 12, borderRadius: 8 }}>
            <strong style={{ color: T.textDim }}>Data & Assumptions:</strong>
            <ul style={{ marginLeft: 20, marginTop: 6 }}>
              <li>Price data: NBS commodity price reports, {state.crop} market in SW Nigeria, May 2023 - Mar 2026.</li>
              <li>Farmgate price = market price x {(result.farmgateDiscount * 100).toFixed(0)}%.</li>
              <li>Profit ranges assume +/-{(YIELD_UNCERTAINTY_CV * 100).toFixed(0)}% yield and +/-{(PRICE_UNCERTAINTY_BASE * 100).toFixed(0)}% price variation.</li>
            </ul>
          </div>
        </>
      )}
    </>
  );
}

function Summary({ result, state }: { result: CalculationResult; state: AppState }) {
  return (
    <>
      <AlertBanner variant="green" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, marginBottom: 8 }}>
          <strong>{state.crop}</strong> planted {MONTH_NAMES[state.plantMonth - 1]} {state.plantYear} - sell <strong>{result.best.month}</strong> for likely profit of <strong>{fmt(result.best.profitLow)}</strong> - <strong>{fmt(result.best.profitHigh)}</strong>.
        </div>
        {result.coversCosts && <div style={{ fontSize: 11 }}>Even in a weaker season, this window should cover input costs.</div>}
        {result.bestProfitHasLossRisk && <div style={{ fontSize: 11 }}>Worst-case scenario has loss risk. Budget contingency.</div>}
        {result.percentDiff && <div style={{ fontSize: 11, marginTop: 6 }}>Selling in {result.worst.month} instead would cut profit by ~{result.percentDiff}%.</div>}
      </AlertBanner>
      {result.advisor && result.advisor.plantMonthName !== FULL_MONTHS[state.plantMonth - 1] && (
        <AlertBanner variant="amber" style={{ marginBottom: 20 }}>
          For the next cycle, planting in <strong>{result.advisor.plantMonthName}</strong> would put harvest into <strong>{result.advisor.sellMonthName}</strong> ({result.advisor.sellLabel}).
        </AlertBanner>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[["Best Month", result.best], ["Worst Month", result.worst] as const].map(([title, row]) => (
          <div key={title} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px" }}>
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>{title}</div>
            <div style={{ fontSize: 12, color: T.amber, marginBottom: 12 }}><QualityDot q={row.quality} />{row.month}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: row.profit >= 0 ? T.green : T.red }}>{fmt(row.profitLow)} - {fmt(row.profitHigh)}</div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>Mid-estimate: <strong style={{ color: row.profit >= 0 ? T.amber : T.red }}>{fmt(row.profit)}</strong></div>
            <div style={{ fontSize: 10, color: T.textFaint, lineHeight: 1.4, marginTop: 12 }}>Market: {fmtPrice(row.marketPrice)} | Farmgate: {fmtPrice(row.price)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
