import { useCallback, useEffect, useRef, useState } from "react";
import { runCalculation } from "../services/priceEngine";
import type { AppState, CalculationOverrides, CalculationResult } from "../types/domain";
import { LOADING_PHRASES } from "../utils/constants";

export function useCalculation(state: AppState, onStepChange: (step: number) => void) {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calcStep, setCalcStep] = useState(0);
  const [loadingPhrase, setLoadingPhrase] = useState(0);
  const timerRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
  }, []);

  const triggerCalc = useCallback((overrides?: CalculationOverrides) => {
    if (debounceRef.current) return;
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null;
    }, 400);

    const inputs = overrides || {
      crop: state.crop,
      plantYear: state.plantYear,
      plantMonth: state.plantMonth,
      hectares: state.hectares,
      yieldPerHa: state.yieldPerHa,
      storageWeeks: state.storageWeeks,
      seedCost: state.seedCostPerHa * state.hectares,
      maintenanceCost: state.maintenanceCostPerHa * state.hectares,
      labourCost: state.labourCostPerHa * state.hectares,
      otherCost: state.otherCostPerHa * state.hectares,
    };

    setCalculating(true);
    setCalcStep(0);
    setLoadingPhrase(0);
    onStepChange(3);
    if (timerRef.current) window.clearInterval(timerRef.current);
    const nextResult = runCalculation({ ...inputs, today: new Date() });
    let i = 0;
    timerRef.current = window.setInterval(() => {
      i += 1;
      setCalcStep(i);
      setLoadingPhrase(Math.min(i, LOADING_PHRASES.length - 1));
      if (i >= 2) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
        setResult(nextResult);
        setCalculating(false);
      }
    }, 300);
  }, [onStepChange, state]);

  return { result, setResult, calculating, calcStep, loadingPhrase, triggerCalc };
}
