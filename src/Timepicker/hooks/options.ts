import type { TimepickerOptions } from "timepicker-ui";

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export const isEqualOptions = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;

  if (a instanceof Date && b instanceof Date) {
    return Object.is(a.getTime(), b.getTime());
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length &&
      a.every((item, index) => isEqualOptions(item, b[index]))
    );
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a);
    return (
      keys.length === Object.keys(b).length &&
      keys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(b, key) &&
          isEqualOptions(a[key], b[key]),
      )
    );
  }

  return false;
};

export const withoutCallbacks = (
  options: TimepickerOptions | undefined,
): TimepickerOptions | undefined => {
  if (!options) return undefined;
  const { callbacks, ...rest } = options;
  return rest;
};
