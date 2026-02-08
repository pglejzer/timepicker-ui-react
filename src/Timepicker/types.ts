import type { TimepickerOptions, CallbacksOptions } from "timepicker-ui";

export interface TimepickerProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "ref" | "value" | "defaultValue" | "onError"
> {
  /** Full configuration object matching timepicker-ui core options */
  options?: TimepickerOptions;

  /** Controlled value for the timepicker */
  value?: string;

  /** Default value for uncontrolled usage */
  defaultValue?: string;

  /** Callback when user confirms time selection */
  onConfirm?: CallbacksOptions["onConfirm"];

  /** Callback when user cancels time selection */
  onCancel?: CallbacksOptions["onCancel"];

  /** Callback when timepicker opens */
  onOpen?: CallbacksOptions["onOpen"];

  /** Callback for real-time updates during interaction */
  onUpdate?: CallbacksOptions["onUpdate"];

  /** Callback when hour mode is activated */
  onSelectHour?: CallbacksOptions["onSelectHour"];

  /** Callback when minute mode is activated */
  onSelectMinute?: CallbacksOptions["onSelectMinute"];

  /** Callback when AM is selected */
  onSelectAM?: CallbacksOptions["onSelectAM"];

  /** Callback when PM is selected */
  onSelectPM?: CallbacksOptions["onSelectPM"];

  /** Callback when validation error occurs */
  onError?: CallbacksOptions["onError"];

  /** Callback when timezone is changed */
  onTimezoneChange?: CallbacksOptions["onTimezoneChange"];

  /** Callback when range time is confirmed */
  onRangeConfirm?: CallbacksOptions["onRangeConfirm"];

  /** Callback when range input switches between from/to */
  onRangeSwitch?: CallbacksOptions["onRangeSwitch"];

  /** Callback when range validation occurs */
  onRangeValidation?: CallbacksOptions["onRangeValidation"];
}

export type TimepickerInstance = InstanceType<
  typeof import("timepicker-ui").TimepickerUI
>;
