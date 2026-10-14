import type { TimepickerOptions } from "timepicker-ui";
import type { CallbackName, ReactCallbacks } from "./callbacks";

type InputAttributes = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "ref" | "value" | "defaultValue" | CallbackName
>;

export interface TimepickerProps extends InputAttributes, ReactCallbacks {
  /** Full configuration object matching timepicker-ui core options */
  options?: TimepickerOptions;

  /** Controlled value for the timepicker */
  value?: string;

  /** Default value for uncontrolled usage */
  defaultValue?: string;
}

export type TimepickerInstance = InstanceType<
  typeof import("timepicker-ui").TimepickerUI
>;
