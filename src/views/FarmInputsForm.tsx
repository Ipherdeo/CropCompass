import CROP_META_JSON from "../data/cropMeta.json";
import CostInput from "../components/inputs/CostInput";
import FarmSizeInput from "../components/inputs/FarmSizeInput";
import YieldInput from "../components/inputs/YieldInput";
import FertPanel from "../components/results/FertPanel";
import SliderInput from "../components/ui/SliderInput";
import { calcFertSuggestion } from "../services/planner";
import { T } from "../styles/tokens";
import type { AppState, CropMetaMap, CropName } from "../types/domain";
import { FULL_MONTHS } from "../utils/constants";
import { fmt } from "../utils/format";

const CROP_META = CROP_META_JSON as CropMetaMap;

interface FarmInputsFormProps {
  state: AppState;
  thisYear: number;
  setState: (patch: Partial<AppState>) => void;
  onBack: () => void;
  onAnalyze: () => void;
}

export default function FarmInputsForm({ state, thisYear, setState, onBack, onAnalyze }: FarmInputsFormProps) {
  if (!state.crop) return null;
  const crop = state.crop as CropName;
  const meta = CROP_META[crop];
  const totalCostPerHa = state.seedCostPerHa + state.maintenanceCostPerHa + state.labourCostPerHa + state.otherCostPerHa;
  const totalCost = totalCostPerHa * state.hectares;
  const fertSuggestion = calcFertSuggestion(crop, state.hectares, state.plantYear, state.plantMonth);

  return (
    <>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: T.textDim, fontSize: 11, marginBottom: 24 }}>Back to crops</button>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 400, marginBottom: 8 }}>{meta.emoji} Farm Details</h2>
        <p style={{ color: T.textMid, fontSize: 13 }}>Adjust your farm size, expected yield, and input costs.</p>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 16px", marginBottom: 32 }}>
        <FarmSizeInput hectares={state.hectares} onChange={hectares => setState({ hectares })} />
        <YieldInput crop={crop} hectares={state.hectares} yieldPerHa={state.yieldPerHa} onChange={yieldPerHa => setState({ yieldPerHa })} />
        <div style={{ background: "rgba(27,94,32,0.1)", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: T.textDim, marginBottom: 20 }}>
          <div>{meta.emoji} will need {meta.growthMonths.min}-{meta.growthMonths.max} months to harvest.</div>
          <div>Storage extends your sell window only if you can store without spoilage.</div>
        </div>
        <SliderInput
          label="Storage (weeks)"
          value={state.storageWeeks}
          onChange={storageWeeks => setState({ storageWeeks })}
          min={0}
          max={26}
          format={v => v === 0 ? "No storage" : `${v} weeks`}
          hint="After harvest, how long can you store without significant loss?"
        />
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 16px", marginBottom: 32 }}>
        <h3 style={{ fontFamily: T.fontSerif, fontSize: 16, marginBottom: 12, color: T.text }}>Planting Date & Costs</h3>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <SelectField label="Month" value={state.plantMonth} onChange={plantMonth => setState({ plantMonth })} options={FULL_MONTHS.map((m, i) => ({ label: m, value: i + 1 }))} />
          <SelectField label="Year" value={state.plantYear} onChange={plantYear => setState({ plantYear })} options={[thisYear, thisYear + 1].map(y => ({ label: String(y), value: y }))} />
        </div>
        <CostInput label="Seed Cost" hint={meta.note} valuePerHa={state.seedCostPerHa} onChange={seedCostPerHa => setState({ seedCostPerHa })} hectares={state.hectares} />
        <CostInput label="Maintenance" valuePerHa={state.maintenanceCostPerHa} onChange={maintenanceCostPerHa => setState({ maintenanceCostPerHa })} hectares={state.hectares} />
        <CostInput label="Labour" valuePerHa={state.labourCostPerHa} onChange={labourCostPerHa => setState({ labourCostPerHa })} hectares={state.hectares} />
        <CostInput label="Other" valuePerHa={state.otherCostPerHa} onChange={otherCostPerHa => setState({ otherCostPerHa })} hectares={state.hectares} />
        <div style={{ background: T.bgCost, border: `1px solid ${T.borderCost}`, borderRadius: 8, padding: "12px", marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: T.textMid }}>Total farm cost</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#d4a574", fontFamily: T.fontMono }}>{fmt(totalCost)}</span>
          </div>
          <div style={{ fontSize: 10, color: T.textFaint }}>NGN{totalCostPerHa.toLocaleString()} per hectare</div>
        </div>
        <FertPanel fertSuggestion={fertSuggestion} plantYear={state.plantYear} plantMonth={state.plantMonth} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "12px", background: "none", border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMid, cursor: "pointer", fontSize: 13 }}>Back</button>
        <button onClick={onAnalyze} className="btn-primary" style={{ flex: 2, padding: "12px", background: T.amber, border: "none", borderRadius: 8, color: "#0d1f0d", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Analyze</button>
      </div>
    </>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: number; onChange: (value: number) => void; options: { label: string; value: number }[] }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: 12, color: T.textMid }}>{label}</label>
      <select value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: "100%", padding: "6px 8px", marginTop: 4, background: "rgba(27,94,32,0.15)", border: `1px solid ${T.borderMid}`, borderRadius: 6, color: T.amber, fontSize: 12 }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
