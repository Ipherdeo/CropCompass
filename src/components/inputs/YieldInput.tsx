/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import CROP_META_JSON from "../../data/cropMeta.json";
import LOCAL_YIELD_UNITS_JSON from "../../data/localYieldUnits.json";
import { T } from "../../styles/tokens";
import type { CropMetaMap, CropName, LocalYieldUnits } from "../../types/domain";

const CROP_META = CROP_META_JSON as CropMetaMap;
const LOCAL_YIELD_UNITS = LOCAL_YIELD_UNITS_JSON as LocalYieldUnits;

interface YieldInputProps {
  crop: CropName;
  hectares: number;
  yieldPerHa: number;
  onChange: (value: number) => void;
}

export default function YieldInput({ crop, hectares, yieldPerHa, onChange }: YieldInputProps) {
  const units = LOCAL_YIELD_UNITS[crop] || [{ label: "tonnes", ratio: 1, peakPerHa: 20 }];
  const [unitIdx, setUnitIdx] = useState(0);
  const u = units[unitIdx] ?? units[0];
  const meta = CROP_META[crop];
  const localCountFromYield = yieldPerHa * hectares / u.ratio;
  const [rawCount, setRawCount] = useState(String(Math.round(localCountFromYield)));

  useEffect(() => {
    setRawCount(String(Math.round(yieldPerHa * hectares / u.ratio)));
  }, [unitIdx, hectares]); // eslint-disable-line react-hooks/exhaustive-deps

  const isOutOfRange = yieldPerHa < meta.yieldRange.min || yieldPerHa > meta.yieldRange.max;

  function commitCount(v: string) {
    const count = parseFloat(v) || 0;
    const tPerFarm = count * u.ratio;
    const tPerHa = hectares > 0 ? tPerFarm / hectares : 0;
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
            width: 72,
            background: "rgba(27,94,32,0.15)",
            border: `1px solid ${T.borderMid}`,
            borderRadius: 6,
            padding: "3px 6px",
            color: T.amber,
            fontSize: 13,
            fontFamily: T.fontMono,
            textAlign: "right",
          }}
        />
      </div>
      <div role="group" aria-label="Yield unit" style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
        {units.map((uu, i) => (
          <button
            key={uu.label}
            onClick={() => setUnitIdx(i)}
            aria-pressed={unitIdx === i}
            style={{
              padding: "2px 8px",
              fontSize: 10,
              borderRadius: 4,
              cursor: "pointer",
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
        approx. {yieldPerHa.toFixed(1)} t/ha - SW Nigeria typical: {meta.yieldRange.min}-{meta.yieldRange.max} t/ha
      </div>
      {isOutOfRange && (
        <div role="alert" style={{ fontSize: 11, color: "#d7b45b", marginBottom: 4, lineHeight: 1.4 }}>
          This yield is outside the typical SW Nigeria range. Check the count is for your whole farm, not per hectare.
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
