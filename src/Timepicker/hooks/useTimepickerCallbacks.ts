import { useEffect } from "react";
import type { TimepickerInstance, TimepickerProps } from "../types";

type ReactCallbacks = {
  onConfirm?: TimepickerProps["onConfirm"];
  onCancel?: TimepickerProps["onCancel"];
  onOpen?: TimepickerProps["onOpen"];
  onUpdate?: TimepickerProps["onUpdate"];
  onSelectHour?: TimepickerProps["onSelectHour"];
  onSelectMinute?: TimepickerProps["onSelectMinute"];
  onSelectAM?: TimepickerProps["onSelectAM"];
  onSelectPM?: TimepickerProps["onSelectPM"];
  onError?: TimepickerProps["onError"];
  onTimezoneChange?: TimepickerProps["onTimezoneChange"];
  onRangeConfirm?: TimepickerProps["onRangeConfirm"];
  onRangeSwitch?: TimepickerProps["onRangeSwitch"];
  onRangeValidation?: TimepickerProps["onRangeValidation"];
};

export const useTimepickerCallbacks = (
  pickerRef: React.RefObject<TimepickerInstance | null>,
  attachEventHandlers: (picker: TimepickerInstance) => void,
  detachEventHandlers: (picker: TimepickerInstance) => void,
  reactCallbacks: ReactCallbacks,
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
  }, [
    attachEventHandlers,
    detachEventHandlers,
    reactCallbacks.onConfirm,
    reactCallbacks.onCancel,
    reactCallbacks.onOpen,
    reactCallbacks.onUpdate,
    reactCallbacks.onSelectHour,
    reactCallbacks.onSelectMinute,
    reactCallbacks.onSelectAM,
    reactCallbacks.onSelectPM,
    reactCallbacks.onError,
    reactCallbacks.onTimezoneChange,
    reactCallbacks.onRangeConfirm,
    reactCallbacks.onRangeSwitch,
    reactCallbacks.onRangeValidation,
  ]);
};
