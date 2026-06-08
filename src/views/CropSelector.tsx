import CROP_META_JSON from "../data/cropMeta.json";
import { T } from "../styles/tokens";
import type { CropMetaMap, CropName } from "../types/domain";

const CROP_META = CROP_META_JSON as CropMetaMap;

interface CropSelectorProps {
  crop: CropName | null;
  onSelect: (crop: CropName) => void;
}

export default function CropSelector({ crop, onSelect }: CropSelectorProps) {
  return (
    <>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 style={{ fontFamily: T.fontSerif, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 8, letterSpacing: "-0.5px" }}>
          When should you sell<br />
          <em style={{ fontStyle: "italic", color: T.amber }}>to maximise your profit?</em>
        </h1>
        <p style={{ color: T.textDim, fontSize: 14, maxWidth: 480, margin: "0 auto" }}>
          Based on historical SW Nigeria price patterns. Select your crop to begin.
        </p>
      </div>
      <div role="list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
        {(Object.entries(CROP_META) as [CropName, CropMetaMap[CropName]][]).map(([name, m]) => (
          <div
            key={name}
            role="listitem"
            className="crop-card"
            tabIndex={0}
            aria-label={`Select ${name}, ${m.growthMonths.min}-${m.growthMonths.max} months to harvest`}
            onClick={() => onSelect(name)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(name); } }}
            style={{ background: crop === name ? "rgba(249,168,37,0.08)" : T.bgCard, border: `1px solid ${crop === name ? T.amber : T.border}`, borderRadius: 12, padding: "16px 12px", textAlign: "center" }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }} aria-hidden="true">{m.emoji}</div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 600, color: crop === name ? T.amber : "#c8e6c9" }}>{name}</div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>{m.growthMonths.min}-{m.growthMonths.max} mo</div>
          </div>
        ))}
      </div>
    </>
  );
}
