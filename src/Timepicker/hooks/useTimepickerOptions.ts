import { useEffect } from "react";
import type { TimepickerOptions } from "timepicker-ui";
import type { TimepickerInstance } from "../types";

export const useTimepickerOptions = (
  pickerRef: React.RefObject<TimepickerInstance | null>,
  options: TimepickerOptions | undefined
) => {
  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker || !options) return;

    picker.update({ options, create: true });
  }, [options]);
};
