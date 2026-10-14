import { useEffect, useRef } from "react";
import type { TimepickerOptions } from "timepicker-ui";
import type { TimepickerInstance } from "../types";
import { isEqualOptions, withoutCallbacks } from "./options";

export const useTimepickerOptions = (
  pickerRef: React.RefObject<TimepickerInstance | null>,
  options: TimepickerOptions | undefined
) => {
  const appliedRef = useRef(options);

  useEffect(() => {
    const picker = pickerRef.current;
    const next = withoutCallbacks(options);
    if (!picker || !next) return;
    if (isEqualOptions(withoutCallbacks(appliedRef.current), next)) return;

    picker.update({ options: next, create: true });
    appliedRef.current = options;
  }, [options]);
};
