import type { TimepickerInstance } from "../types";

export const applyValue = (
  picker: TimepickerInstance,
  value: string,
): void => {
  if (picker.options.range.enabled) return;
  picker.setValue(value, true);
};
