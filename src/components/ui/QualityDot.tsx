import { QUALITY_TIERS } from "../../utils/constants";
import type { Quality } from "../../types/domain";

export default function QualityDot({ q }: { q: Quality }) {
  return (
    <span aria-hidden="true" style={{
      display: "inline-block",
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: QUALITY_TIERS[q]?.color || "#888",
      marginRight: 4,
      verticalAlign: "middle",
      flexShrink: 0,
    }} />
  );
}
