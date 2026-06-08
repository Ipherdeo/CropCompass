/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import AREA_UNITS_JSON from "../../data/areaUnits.json";
import { T } from "../../styles/tokens";
import type { AreaUnitName, AreaUnits } from "../../types/domain";

const AREA_UNITS = AREA_UNITS_JSON as AreaUnits;

interface FarmSizeInputProps {
  hectares: number;
  onChange: (value: number) => void;
}

export default function FarmSizeInput({ hectares, onChange }: FarmSizeInputProps) {
  const [unit, setUnit] = useState<AreaUnitName>("hectares");
  const u = AREA_UNITS[unit];
  const displayVal = parseFloat((hectares / u.toHa).toFixed(unit === "hectares" ? 3 : 2));
  const [rawStr, setRawStr] = useState(String(displayVal));

  useEffect(() => {
    setRawStr(String(parseFloat((hectares / u.toHa).toFixed(unit === "hectares" ? 3 : 2))));
  }, [hectares, unit]); // eslint-disable-line react-hooks/exhaustive-deps

  function commitFromDisplay(v: string) {
    const n = parseFloat(v);
    if (!Number.isNaN(n) && n > 0) onChange(Math.max(0.023, Math.min(20, n * u.toHa)));
  }

  const minDisplay = parseFloat((0.023 / u.toHa).toFixed(2));
  const maxDisplay = parseFloat((20 / u.toHa).toFixed(2));
  const sliderStep = unit === "plots" ? 0.5 : unit === "acres" ? 0.1 : 0.023;
  const unitKeys = Object.keys(AREA_UNITS) as AreaUnitName[];

  function displayLabel() {
    const plots = hectares / AREA_UNITS.plots.toHa;
    const acres = hectares / AREA_UNITS.acres.toHa;
    if (unit === "plots") return `${plots.toFixed(1)} plots (${hectares.toFixed(3)} ha)`;
    if (unit === "acres") return `${acres.toFixed(2)} acres (${hectares.toFixed(3)} ha)`;
    return `${hectares.toFixed(3)} ha`;
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label style={{ fontSize: 13, color: T.textMid, fontFamily: T.fontSerif }}>Farm Size</label>
        <div role="group" aria-label="Area unit" style={{ display: "flex", gap: 4 }}>
          {unitKeys.map(k => (
            <button
              key={k}
              onClick={() => setUnit(k)}
              aria-pressed={unit === k}
              style={{
                padding: "2px 8px",
                fontSize: 10,
                borderRadius: 4,
                cursor: "pointer",
                background: unit === k ? T.amber : "rgba(27,94,32,0.2)",
                color: unit === k ? "#0d1f0d" : T.textMid,
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
            width: 80,
            background: "rgba(27,94,32,0.15)",
            border: `1px solid ${T.borderMid}`,
            borderRadius: 6,
            padding: "4px 8px",
            color: T.amber,
            fontSize: 13,
            fontFamily: T.fontMono,
            textAlign: "right",
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
        <span>1/2 plot</span><span>20 ha</span>
      </div>
    </div>
  );
}
