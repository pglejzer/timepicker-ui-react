import { useEffect, useRef } from "react";
import type { TimepickerOptions } from "timepicker-ui";
import type { TimepickerInstance } from "../types";
import { isSSR } from "../utils";
import { withoutCallbacks } from "./options";
import { applyValue } from "./value";

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

      const picker = new TimepickerUI(
        inputRef.current,
        withoutCallbacks(options)
      );
      attachEventHandlers(picker);
      picker.create();

      pickerRef.current = picker;

      if (initialValue !== undefined) {
        applyValue(picker, initialValue);
      } else if (initialDefaultValue !== undefined) {
        applyValue(picker, initialDefaultValue);
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
