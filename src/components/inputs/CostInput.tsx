/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { T } from "../../styles/tokens";
import { fmt } from "../../utils/format";

interface CostInputProps {
  label: string;
  hint?: string;
  valuePerHa: number;
  onChange: (value: number) => void;
  max?: number;
  step?: number;
  hectares: number;
}

export default function CostInput({ label, hint, valuePerHa, onChange, max = 500000, step = 5000, hectares }: CostInputProps) {
  const totalVal = Math.round(valuePerHa * hectares);
  const [rawPerHa, setRawPerHa] = useState(String(Math.round(valuePerHa)));

  useEffect(() => {
    setRawPerHa(String(Math.round(valuePerHa)));
  }, [valuePerHa]);

  function commitPerHa(v: string) {
    const n = Math.round(Math.max(0, Math.min(max, Number(v) || 0)) / step) * step;
    onChange(n);
    setRawPerHa(String(n));
  }

  const inputId = `cost-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <label htmlFor={inputId} style={{ fontSize: 13, color: T.textMid, fontFamily: T.fontSerif }}>{label}</label>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            value={rawPerHa}
            aria-label={`${label} per hectare`}
            onChange={e => setRawPerHa(e.target.value)}
            onBlur={e => commitPerHa(e.target.value)}
            onKeyDown={e => e.key === "Enter" && commitPerHa(rawPerHa)}
            style={{
              width: 80,
              background: "rgba(27,94,32,0.15)",
              border: `1px solid ${T.borderMid}`,
              borderRadius: 6,
              padding: "3px 6px",
              color: T.amber,
              fontSize: 12,
              fontFamily: T.fontMono,
              textAlign: "right",
            }}
          />
          <span style={{ fontSize: 11, color: T.textDim, whiteSpace: "nowrap" }}>/ha</span>
        </div>
      </div>
      {hint && <div style={{ fontSize: 11, color: T.textDim, marginBottom: 4 }}>{hint}</div>}
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={Math.round(valuePerHa)}
        aria-label={`${label} slider`}
        onChange={e => { onChange(Number(e.target.value)); setRawPerHa(String(e.target.value)); }}
        style={{ width: "100%", accentColor: T.amber, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textFaint, marginTop: 2 }}>
        <span>NGN0/ha</span>
        <span style={{ color: T.amber, fontWeight: 600 }}>
          Total: {fmt(totalVal)}
          {hectares !== 1 && <span style={{ color: T.textDim, fontWeight: 400 }}> ({hectares.toFixed(2)} ha)</span>}
        </span>
      </div>
    </div>
  );
}
