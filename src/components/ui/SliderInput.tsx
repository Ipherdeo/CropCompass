import { T } from "../../styles/tokens";

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
  hint?: string;
}

export default function SliderInput({ label, value, onChange, min, max, step = 1, format, hint }: SliderInputProps) {
  const inputId = `slider-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label htmlFor={inputId} style={{ fontSize: 13, color: T.textMid, fontFamily: T.fontSerif }}>{label}</label>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.amber }}>{format ? format(value) : value}</span>
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
