import React, { useRef, forwardRef, useImperativeHandle } from "react";
import type { TimepickerProps } from "./types";
import { CALLBACK_EVENTS } from "./callbacks";
import type { CallbackName, ReactCallbacks } from "./callbacks";
import {
  useEventHandlers,
  useTimepickerInstance,
  useTimepickerValue,
  useTimepickerOptions,
  useTimepickerCallbacks,
} from "./hooks";

type PickerProps = Omit<
  TimepickerProps,
  "options" | "value" | "defaultValue" | "onChange"
>;

type InputProps = Omit<PickerProps, CallbackName>;

const copyCallback = <K extends CallbackName>(
  target: ReactCallbacks,
  source: ReactCallbacks,
  name: K,
): void => {
  target[name] = source[name];
};

const splitCallbacks = (
  props: PickerProps,
): { reactCallbacks: ReactCallbacks; inputProps: InputProps } => {
  const reactCallbacks: ReactCallbacks = {};
  const inputProps: PickerProps = { ...props };

  for (const [name] of CALLBACK_EVENTS) {
    copyCallback(reactCallbacks, props, name);
    delete inputProps[name];
  }

  return { reactCallbacks, inputProps };
};

export const Timepicker = forwardRef<HTMLInputElement, TimepickerProps>(
  (props, forwardedRef) => {
    const { options, value, defaultValue, onChange, ...pickerProps } = props;
    const { reactCallbacks, inputProps } = splitCallbacks(pickerProps);

    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(
      forwardedRef,
      () => inputRef.current as HTMLInputElement,
      [],
    );

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

    useTimepickerOptions(pickerRef, options);
    useTimepickerValue(pickerRef, value);
    useTimepickerCallbacks(pickerRef, attachEventHandlers, detachEventHandlers);

    const isControlled = value !== undefined;

    return (
      <div className="tp-ui">
        <input
          ref={inputRef}
          type="text"
          {...inputProps}
          {...(isControlled ? { value, readOnly: true } : { defaultValue })}
        />
      </div>
    );
  },
);

Timepicker.displayName = "Timepicker";
