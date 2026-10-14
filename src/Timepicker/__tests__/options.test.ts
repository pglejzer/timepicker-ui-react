import { describe, it, expect } from "vitest";
import type { TimepickerOptions } from "timepicker-ui";
import { isEqualOptions, withoutCallbacks } from "../hooks/options";

describe("withoutCallbacks", () => {
  it("returns undefined for undefined options", () => {
    expect(withoutCallbacks(undefined)).toBeUndefined();
  });

  it("strips the callbacks group and keeps the other groups", () => {
    const options: TimepickerOptions = {
      clock: { type: "24h" },
      ui: { theme: "dark" },
      callbacks: { onConfirm: () => undefined },
    };

    const result = withoutCallbacks(options);

    expect(result).toEqual({ clock: { type: "24h" }, ui: { theme: "dark" } });
    expect(result).not.toHaveProperty("callbacks");
  });

  it("does not mutate the given options", () => {
    const onConfirm = () => undefined;
    const options: TimepickerOptions = {
      ui: { theme: "dark" },
      callbacks: { onConfirm },
    };

    withoutCallbacks(options);

    expect(options).toEqual({ ui: { theme: "dark" }, callbacks: { onConfirm } });
    expect(options.callbacks?.onConfirm).toBe(onConfirm);
  });
});

describe("isEqualOptions", () => {
  it("treats the same reference as equal", () => {
    const options: TimepickerOptions = { ui: { theme: "dark" } };

    expect(isEqualOptions(options, options)).toBe(true);
  });

  it.each([
    ["equal strings", "dark", "dark", true],
    ["different strings", "dark", "basic", false],
    ["equal numbers", 5, 5, true],
    ["different numbers", 5, 15, false],
    ["a number and its string", 5, "5", false],
    ["different booleans", true, false, false],
    ["undefined and null", undefined, null, false],
  ])("compares primitives: %s", (_label, a, b, expected) => {
    expect(isEqualOptions(a, b)).toBe(expected);
  });

  it.each([
    ["null and an empty object", null, {}],
    ["an empty object and null", {}, null],
  ])("treats %s as different", (_label, a, b) => {
    expect(isEqualOptions(a, b)).toBe(false);
  });

  it("treats arrays with the same items as equal", () => {
    expect(isEqualOptions([1, "3", 5], [1, "3", 5])).toBe(true);
  });

  it("treats arrays of different length as different", () => {
    expect(isEqualOptions([1, 2], [1, 2, 3])).toBe(false);
  });

  it("treats arrays of the same length with a different item as different", () => {
    expect(isEqualOptions([1, 2], [1, 3])).toBe(false);
  });

  it.each([
    ["an empty array and an empty object", [], {}],
    ["an empty object and an empty array", {}, []],
  ])("treats %s as different", (_label, a, b) => {
    expect(isEqualOptions(a, b)).toBe(false);
  });

  it("treats structurally equal nested plain objects as equal", () => {
    const build = (): TimepickerOptions => ({
      clock: { type: "12h", disabledTime: { hours: [1, "3", 5] } },
      ui: { theme: "dark", mode: "clock" },
    });

    expect(isEqualOptions(build(), build())).toBe(true);
  });

  it("ignores key order in plain objects", () => {
    expect(isEqualOptions({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });

  it("treats plain objects with a different key count as different", () => {
    expect(isEqualOptions({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it("treats plain objects with the same key count but different key names as different", () => {
    expect(isEqualOptions({ theme: undefined }, { mode: undefined })).toBe(false);
  });

  it("treats plain objects with a different nested value as different", () => {
    expect(
      isEqualOptions({ ui: { theme: "dark" } }, { ui: { theme: "basic" } }),
    ).toBe(false);
  });

  it("treats the same function as equal", () => {
    const onConfirm = () => undefined;

    expect(isEqualOptions(onConfirm, onConfirm)).toBe(true);
  });

  it("treats two functions with the same body as different", () => {
    expect(
      isEqualOptions(
        () => undefined,
        () => undefined,
      ),
    ).toBe(false);
  });

  it("treats the same Date instance as equal", () => {
    const date = new Date(0);

    expect(isEqualOptions(date, date)).toBe(true);
  });

  it("treats two Date instances with the same time as equal", () => {
    expect(isEqualOptions(new Date(0), new Date(0))).toBe(true);
  });

  it("treats two Date instances with different times as different", () => {
    expect(isEqualOptions(new Date(0), new Date(1))).toBe(false);
  });

  it.each([
    ["a Date and its timestamp", new Date(0), 0],
    ["a timestamp and a Date", 0, new Date(0)],
    ["a Date and an empty object", new Date(0), {}],
    ["an empty object and a Date", {}, new Date(0)],
  ])("treats %s as different", (_label, a, b) => {
    expect(isEqualOptions(a, b)).toBe(false);
  });

  it("treats options holding Date instances with the same time as equal", () => {
    const build = (): TimepickerOptions => ({
      clock: { currentTime: { time: new Date(0) } },
    });

    expect(isEqualOptions(build(), build())).toBe(true);
  });

  it("treats equal objects without a prototype as equal", () => {
    const build = () => Object.assign(Object.create(null), { theme: "dark" });

    expect(isEqualOptions(build(), build())).toBe(true);
  });
});
