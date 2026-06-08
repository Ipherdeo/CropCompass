import { useState } from "react";
import { T } from "../../styles/tokens";
import type { FertSuggestion } from "../../types/domain";
import { MONTH_NAMES } from "../../utils/constants";
import { fmt } from "../../utils/format";

interface FertPanelProps {
  fertSuggestion: FertSuggestion | null;
  plantYear: number;
  plantMonth: number;
}

export default function FertPanel({ fertSuggestion, plantYear, plantMonth }: FertPanelProps) {
  const [expanded, setExpanded] = useState(false);
  if (!fertSuggestion) return null;

  return (
    <div style={{ background: "rgba(27,94,32,0.1)", border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
      <button
        onClick={() => setExpanded(x => !x)}
        aria-expanded={expanded}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div>
          <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>Fertilizer Guide</span>
          <span style={{ fontSize: 11, color: T.textDim, marginLeft: 8 }}>{fertSuggestion.bags} bags - {fmt(fertSuggestion.totalCost)} est.</span>
        </div>
        <span aria-hidden="true" style={{ fontSize: 11, color: T.textFaint }}>{expanded ? "less" : "details"}</span>
      </button>

      {expanded && (
        <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, color: T.amber, lineHeight: 1.5, margin: "10px 0 8px", fontWeight: 500 }}>{fertSuggestion.note}</div>
          <div style={{ fontSize: 11, color: T.green, marginBottom: 8 }}>{fertSuggestion.type}</div>
          <div style={{ marginBottom: 10 }}>
            {fertSuggestion.splitSchedule.map((s, i) => (
              <div key={`${s.label}-${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < fertSuggestion.splitSchedule.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div>
                  <span style={{ fontSize: 12, color: T.textMid }}>Application {i + 1}</span>
                  <span style={{ fontSize: 11, color: T.textDim, marginLeft: 8 }}>{s.label}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 12, color: T.amber, fontFamily: T.fontMono }}>{s.bags} bags</span>
                  <span style={{ fontSize: 11, color: T.textFaint, marginLeft: 6 }}>{fmt(s.cost)}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: T.textFaint }}>
            Price est. for {MONTH_NAMES[plantMonth - 1]}-{plantYear} at ~{fmt(fertSuggestion.pricePerBag)}/bag. Verify locally; fertilizer prices are FX-driven.
          </div>
        </div>
      )}
    </div>
  );
}
