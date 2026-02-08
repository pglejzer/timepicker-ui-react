import React, { useRef, forwardRef, useImperativeHandle } from "react";
import type { TimepickerProps } from "./types";
import {
  useEventHandlers,
  useTimepickerInstance,
  useTimepickerValue,
  useTimepickerOptions,
  useTimepickerCallbacks,
} from "./hooks";

export const Timepicker = forwardRef<HTMLInputElement, TimepickerProps>(
  (props, forwardedRef) => {
    const {
      options,
      value,
      defaultValue,
      onConfirm,
      onCancel,
      onOpen,
      onUpdate,
      onSelectHour,
      onSelectMinute,
      onSelectAM,
      onSelectPM,
      onError,
      onTimezoneChange,
      onRangeConfirm,
      onRangeSwitch,
      onRangeValidation,
      onChange,
      ...inputProps
    } = props;

    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(
      forwardedRef,
      () => inputRef.current as HTMLInputElement,
      [],
    );

    const reactCallbacks = {
      onConfirm,
      onCancel,
      onOpen,
      onUpdate,
      onSelectHour,
      onSelectMinute,
      onSelectAM,
      onSelectPM,
      onError,
      onTimezoneChange,
      onRangeConfirm,
      onRangeSwitch,
      onRangeValidation,
    };

    const { attachEventHandlers, detachEventHandlers } = useEventHandlers(
      reactCallbacks,
      options?.callbacks,
    );

    const pickerRef = useTimepickerInstance(
      inputRef,
      options,
      value,
      defaultValue,
      attachEventHandlers,
      detachEventHandlers,
    );

    useTimepickerValue(pickerRef, value);
    useTimepickerOptions(pickerRef, options);
    useTimepickerCallbacks(
      pickerRef,
      attachEventHandlers,
      detachEventHandlers,
      reactCallbacks,
    );

    const isControlled = value !== undefined;

    return (
      <input
        ref={inputRef}
        type="text"
        {...inputProps}
        {...(isControlled ? { value, readOnly: true } : { defaultValue })}
      />
    );
  },
);

Timepicker.displayName = "Timepicker";
