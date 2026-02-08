import { useCallback, useMemo } from "react";
import type { CallbacksOptions } from "timepicker-ui";
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

const mergeCallbacks = (
  react: ReactCallbacks,
  opts?: CallbacksOptions,
): CallbacksOptions => ({
  onConfirm:
    react.onConfirm || opts?.onConfirm
      ? (data) => {
          opts?.onConfirm?.(data);
          react.onConfirm?.(data);
        }
      : undefined,

  onCancel:
    react.onCancel || opts?.onCancel
      ? (data) => {
          opts?.onCancel?.(data);
          react.onCancel?.(data);
        }
      : undefined,

  onOpen:
    react.onOpen || opts?.onOpen
      ? (data) => {
          opts?.onOpen?.(data);
          react.onOpen?.(data);
        }
      : undefined,

  onUpdate:
    react.onUpdate || opts?.onUpdate
      ? (data) => {
          opts?.onUpdate?.(data);
          react.onUpdate?.(data);
        }
      : undefined,

  onSelectHour:
    react.onSelectHour || opts?.onSelectHour
      ? (data) => {
          opts?.onSelectHour?.(data);
          react.onSelectHour?.(data);
        }
      : undefined,

  onSelectMinute:
    react.onSelectMinute || opts?.onSelectMinute
      ? (data) => {
          opts?.onSelectMinute?.(data);
          react.onSelectMinute?.(data);
        }
      : undefined,

  onSelectAM:
    react.onSelectAM || opts?.onSelectAM
      ? (data) => {
          opts?.onSelectAM?.(data);
          react.onSelectAM?.(data);
        }
      : undefined,

  onSelectPM:
    react.onSelectPM || opts?.onSelectPM
      ? (data) => {
          opts?.onSelectPM?.(data);
          react.onSelectPM?.(data);
        }
      : undefined,

  onError:
    react.onError || opts?.onError
      ? (data) => {
          opts?.onError?.(data);
          react.onError?.(data);
        }
      : undefined,

  onTimezoneChange:
    react.onTimezoneChange || opts?.onTimezoneChange
      ? (data) => {
          opts?.onTimezoneChange?.(data);
          react.onTimezoneChange?.(data);
        }
      : undefined,

  onRangeConfirm:
    react.onRangeConfirm || opts?.onRangeConfirm
      ? (data) => {
          opts?.onRangeConfirm?.(data);
          react.onRangeConfirm?.(data);
        }
      : undefined,

  onRangeSwitch:
    react.onRangeSwitch || opts?.onRangeSwitch
      ? (data) => {
          opts?.onRangeSwitch?.(data);
          react.onRangeSwitch?.(data);
        }
      : undefined,

  onRangeValidation:
    react.onRangeValidation || opts?.onRangeValidation
      ? (data) => {
          opts?.onRangeValidation?.(data);
          react.onRangeValidation?.(data);
        }
      : undefined,
});

export const useEventHandlers = (
  reactCallbacks: ReactCallbacks,
  optionsCallbacks?: CallbacksOptions,
) => {
  const merged = useMemo(
    () => mergeCallbacks(reactCallbacks, optionsCallbacks),
    [
      optionsCallbacks,
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
    ],
  );

  const attach = useCallback(
    (picker: TimepickerInstance) => {
      if (merged.onConfirm) picker.on("confirm", merged.onConfirm);
      if (merged.onCancel) picker.on("cancel", merged.onCancel);
      if (merged.onOpen) picker.on("open", merged.onOpen);
      if (merged.onUpdate) picker.on("update", merged.onUpdate);
      if (merged.onSelectHour) picker.on("select:hour", merged.onSelectHour);
      if (merged.onSelectMinute)
        picker.on("select:minute", merged.onSelectMinute);
      if (merged.onSelectAM) picker.on("select:am", merged.onSelectAM);
      if (merged.onSelectPM) picker.on("select:pm", merged.onSelectPM);
      if (merged.onError) picker.on("error", merged.onError);
      if (merged.onTimezoneChange)
        picker.on("timezone:change", merged.onTimezoneChange);
      if (merged.onRangeConfirm)
        picker.on("range:confirm", merged.onRangeConfirm);
      if (merged.onRangeSwitch) picker.on("range:switch", merged.onRangeSwitch);
      if (merged.onRangeValidation)
        picker.on("range:validation", merged.onRangeValidation);
    },
    [merged],
  );

  const detach = useCallback(
    (picker: TimepickerInstance) => {
      if (merged.onConfirm) picker.off("confirm", merged.onConfirm);
      if (merged.onCancel) picker.off("cancel", merged.onCancel);
      if (merged.onOpen) picker.off("open", merged.onOpen);
      if (merged.onUpdate) picker.off("update", merged.onUpdate);
      if (merged.onSelectHour) picker.off("select:hour", merged.onSelectHour);
      if (merged.onSelectMinute)
        picker.off("select:minute", merged.onSelectMinute);
      if (merged.onSelectAM) picker.off("select:am", merged.onSelectAM);
      if (merged.onSelectPM) picker.off("select:pm", merged.onSelectPM);
      if (merged.onError) picker.off("error", merged.onError);
      if (merged.onTimezoneChange)
        picker.off("timezone:change", merged.onTimezoneChange);
      if (merged.onRangeConfirm)
        picker.off("range:confirm", merged.onRangeConfirm);
      if (merged.onRangeSwitch)
        picker.off("range:switch", merged.onRangeSwitch);
      if (merged.onRangeValidation)
        picker.off("range:validation", merged.onRangeValidation);
    },
    [merged],
  );

  return { attachEventHandlers: attach, detachEventHandlers: detach };
};
