import { T } from "../../styles/tokens";
import type { CalculationResult } from "../../types/domain";
import { fmt, fmtPrice } from "../../utils/format";
import QualityDot from "../ui/QualityDot";

export default function MonthTable({ result }: { result: CalculationResult }) {
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 600, padding: 16, color: T.text, borderBottom: `1px solid ${T.border}` }}>
        Full Month-by-Month Breakdown
      </div>
      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(27,94,32,0.05)", borderBottom: `1px solid ${T.border}` }}>
            <th style={{ padding: "10px 12px", textAlign: "left", color: T.textMid, fontWeight: 500 }}>Month</th>
            <th style={{ padding: "10px 12px", textAlign: "right", color: T.textMid, fontWeight: 500 }}>Price</th>
            <th style={{ padding: "10px 12px", textAlign: "right", color: T.textMid, fontWeight: 500 }}>Profit Range</th>
            <th style={{ padding: "10px 12px", textAlign: "right", color: T.textMid, fontWeight: 500 }}>Mid</th>
            <th style={{ padding: "10px 12px", textAlign: "center", color: T.textMid, fontWeight: 500 }}>Q</th>
          </tr>
        </thead>
        <tbody>
          {result.results.map((r, i) => (
            <tr key={r.absMonth} style={{ borderBottom: i < result.results.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <td style={{ padding: "10px 12px" }}>
                <span style={{ color: T.amber, fontWeight: 500 }}>{r.month}</span>
                {r.isHarvestWindow && <span style={{ color: T.textDim, fontSize: 10, marginLeft: 4 }}>harvest</span>}
                {r.isStorageWindow && <span style={{ color: T.textDim, fontSize: 10, marginLeft: 4 }}>storage</span>}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "right", color: T.green }}>{fmtPrice(r.marketPrice)}</td>
              <td style={{ padding: "10px 12px", textAlign: "right", color: T.green }}>{fmt(r.profitLow)} - {fmt(r.profitHigh)}</td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 500, color: r.profit >= 0 ? T.green : T.red }}>{fmt(r.profit)}</td>
              <td style={{ padding: "10px 12px", textAlign: "center" }}><QualityDot q={r.quality} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
