import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { T } from "../../styles/tokens";
import type { CalculationResult } from "../../types/domain";
import CustomTooltip from "./CustomTooltip";

export default function ProfitChart({ result }: { result: CalculationResult }) {
  if (result.results.length <= 1) return null;

  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: T.text }}>Profit Across Sell Window</div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={result.results} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={T.green} stopOpacity={0.3} />
              <stop offset="95%" stopColor={T.green} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: T.textDim }} />
          <YAxis tick={{ fontSize: 11, fill: T.textDim }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={result.totalCost} stroke={T.red} strokeDasharray="5 5" label={{ value: "Break-even", position: "right", fill: T.red, fontSize: 10 }} />
          <Area type="monotone" dataKey="profitHigh" stroke="none" fill={T.green} fillOpacity={0.1} />
          <Area type="monotone" dataKey="profit" stroke={T.green} strokeWidth={2} fill="url(#profitGradient)" />
          <Area type="monotone" dataKey="profitLow" stroke="none" fill={T.green} fillOpacity={0.05} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
