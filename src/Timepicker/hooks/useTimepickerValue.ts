import { useEffect, useRef } from "react";
import type { TimepickerInstance } from "../types";
import { applyValue } from "./value";

export const useTimepickerValue = (
  pickerRef: React.RefObject<TimepickerInstance | null>,
  value: string | undefined
) => {
  const previousValueRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker || value === undefined || value === previousValueRef.current) {
      return undefined;
    }

    applyValue(picker, value);
    previousValueRef.current = value;
  }, [value]);
};
