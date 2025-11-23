import { useEffect, useRef } from "react";
import type { TimepickerOptions } from "timepicker-ui";
import type { TimepickerInstance } from "../types";
import { isSSR } from "../utils";

export const useTimepickerInstance = (
  inputRef: React.RefObject<HTMLInputElement>,
  options: TimepickerOptions | undefined,
  initialValue: string | undefined,
  initialDefaultValue: string | undefined,
  attachEventHandlers: (picker: TimepickerInstance) => void,
  detachEventHandlers: (picker: TimepickerInstance) => void
) => {
  const pickerRef = useRef<TimepickerInstance | null>(null);

  useEffect(() => {
    if (isSSR() || !inputRef.current) return;

    let mounted = true;

    import("timepicker-ui").then(({ TimepickerUI }) => {
      if (!mounted || !inputRef.current) return;

      const picker = new TimepickerUI(inputRef.current, options);
      picker.create();
      attachEventHandlers(picker);

      pickerRef.current = picker;

      if (initialValue !== undefined) {
        picker.setValue(initialValue, true);
      } else if (initialDefaultValue !== undefined) {
        picker.setValue(initialDefaultValue, true);
      }
    });

    return () => {
      mounted = false;
      const picker = pickerRef.current;
      if (picker) {
        detachEventHandlers(picker);
        picker.destroy();
        pickerRef.current = null;
      }
    };
  }, []);

  return pickerRef;
};
