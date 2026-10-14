import { useEffect } from "react";
import type { TimepickerInstance } from "../types";

export const useTimepickerCallbacks = (
  pickerRef: React.RefObject<TimepickerInstance | null>,
  attachEventHandlers: (picker: TimepickerInstance) => void,
  detachEventHandlers: (picker: TimepickerInstance) => void,
) => {
  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) return;

    detachEventHandlers(picker);
    attachEventHandlers(picker);

    return () => {
      if (pickerRef.current) {
        detachEventHandlers(pickerRef.current);
      }
    };
  }, [attachEventHandlers, detachEventHandlers]);
};
