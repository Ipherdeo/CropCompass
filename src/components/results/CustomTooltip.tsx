import { T } from "../../styles/tokens";
import type { CalculationRow } from "../../types/domain";
import { fmt, fmtPrice } from "../../utils/format";
import QualityDot from "../ui/QualityDot";

interface TooltipPayload {
  payload?: CalculationRow;
}

export default function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: "#1a2e1a", border: `1px solid ${T.borderMid}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: T.text, minWidth: 180 }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: T.amber }}>{label}</div>
      {d && (
        <>
          <div><QualityDot q={d.quality} />{fmtPrice(d.price)}</div>
          <div style={{ color: T.textMid, fontSize: 11, marginTop: 2 }}>
            Likely range: {fmtPrice(d.priceConfLow)} - {fmtPrice(d.priceConfHigh)}
          </div>
          <div style={{ color: T.green, marginTop: 6 }}>Profit (mid): {fmt(d.profit)}</div>
          <div style={{ color: T.textMid, fontSize: 11 }}>Range: {fmt(d.profitLow)} - {fmt(d.profitHigh)}</div>
        </>
      )}
    </div>
  );
}
