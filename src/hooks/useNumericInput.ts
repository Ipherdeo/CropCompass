import { useCallback, useState } from "react";

export function useNumericInput(initialValue: number, commit: (value: number) => void) {
  const [raw, setRaw] = useState(String(initialValue));
  const commitRaw = useCallback((fallback = 0) => {
    const value = Number(raw);
    const next = Number.isFinite(value) ? value : fallback;
    commit(next);
    setRaw(String(next));
  }, [commit, raw]);

  return { raw, setRaw, commitRaw };
}
