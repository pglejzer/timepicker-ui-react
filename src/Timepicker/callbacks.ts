import type { CallbacksOptions, TimepickerEventMap } from "timepicker-ui";

export const CALLBACK_EVENTS = [
  ["onOpen", "open"],
  ["onShow", "show"],
  ["onCancel", "cancel"],
  ["onConfirm", "confirm"],
  ["onUpdate", "update"],
  ["onSelectHour", "select:hour"],
  ["onSelectMinute", "select:minute"],
  ["onSelectSecond", "select:second"],
  ["onSelectAM", "select:am"],
  ["onSelectPM", "select:pm"],
  ["onSelectPeriod", "select:period"],
  ["onSwitchView", "switch:view"],
  ["onSwitchFace", "switch:face"],
  ["onError", "error"],
  ["onTimezoneChange", "timezone:change"],
  ["onRangeConfirm", "range:confirm"],
  ["onRangeSwitch", "range:switch"],
  ["onRangeValidation", "range:validation"],
  ["onWheelScrollStart", "wheel:scroll:start"],
  ["onWheelScrollEnd", "wheel:scroll:end"],
  ["onClear", "clear"],
] as const satisfies ReadonlyArray<
  readonly [keyof CallbacksOptions, keyof TimepickerEventMap]
>;

export type CallbackName = (typeof CALLBACK_EVENTS)[number][0];
export type ReactCallbacks = Pick<CallbacksOptions, CallbackName>;
