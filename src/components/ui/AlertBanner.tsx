import { T } from "../../styles/tokens";
import type { AlertBannerProps } from "../../types/domain";

export default function AlertBanner({ variant = "amber", children, style }: AlertBannerProps) {
  const styles = {
    amber: { bg: T.amberBg, border: T.amberBorder, color: "#d7b45b" },
    red: { bg: T.redBg, border: T.redBorder, color: T.red },
    green: { bg: T.bgCard, border: T.border, color: T.textMid },
  };
  const s = styles[variant];
  return (
    <div role="alert" style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 12,
      color: s.color,
      lineHeight: 1.5,
      ...style,
    }}>
      {children}
    </div>
  );
}
