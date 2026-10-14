import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTimepickerOptions } from "../hooks/useTimepickerOptions";
import type { TimepickerInstance } from "../types";
import type { CallbacksOptions, TimepickerOptions } from "timepicker-ui";

type PickerRef = { current: TimepickerInstance | null };

const createMockPicker = (): TimepickerInstance =>
  ({
    create: vi.fn(),
    destroy: vi.fn(),
    open: vi.fn(),
    close: vi.fn(),
    setValue: vi.fn(),
    getValue: vi.fn().mockReturnValue("12:00"),
    update: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
    getWrapper: vi.fn(),
  }) as unknown as TimepickerInstance;

const buildOptions = (): TimepickerOptions => ({
  clock: { type: "12h", disabledTime: { hours: [1, "3", 5] } },
  ui: { theme: "dark" },
});

const buildChangedOptions = (): TimepickerOptions => ({
  ...buildOptions(),
  ui: { theme: "crane" },
});

const renderOptionsHook = (
  pickerRef: PickerRef,
  options: TimepickerOptions | undefined,
) =>
  renderHook(({ opts }) => useTimepickerOptions(pickerRef, opts), {
    initialProps: { opts: options },
  });

describe("useTimepickerOptions", () => {
  let mockPicker: TimepickerInstance;
  let update: Mock;

  beforeEach(() => {
    mockPicker = createMockPicker();
    update = mockPicker.update as unknown as Mock;
  });

  it("does not update the picker with the options it was mounted with", () => {
    renderOptionsHook({ current: mockPicker }, buildOptions());

    expect(update).not.toHaveBeenCalled();
  });

  it("does not update when options is undefined", () => {
    renderOptionsHook({ current: mockPicker }, undefined);

    expect(update).not.toHaveBeenCalled();
  });

  it("does not update when the picker is not created yet", () => {
    const { rerender } = renderOptionsHook({ current: null }, buildOptions());

    rerender({ opts: buildChangedOptions() });

    expect(update).not.toHaveBeenCalled();
  });

  it("does not update when a rerender passes an equal options object", () => {
    const { rerender } = renderOptionsHook(
      { current: mockPicker },
      buildOptions(),
    );

    rerender({ opts: buildOptions() });
    rerender({ opts: buildOptions() });

    expect(update).not.toHaveBeenCalled();
  });

  it("updates once with the changed options and skips a later equal copy", () => {
    const { rerender } = renderOptionsHook(
      { current: mockPicker },
      buildOptions(),
    );

    rerender({ opts: buildChangedOptions() });

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      options: buildChangedOptions(),
      create: true,
    });

    rerender({ opts: buildChangedOptions() });

    expect(update).toHaveBeenCalledTimes(1);
  });

  const callbacksOnlyChanges: Array<
    [string, CallbacksOptions | undefined, CallbacksOptions | undefined]
  > = [
    ["replaced", { onConfirm: vi.fn() }, { onConfirm: vi.fn() }],
    ["added", undefined, { onConfirm: vi.fn() }],
    ["removed", { onConfirm: vi.fn() }, undefined],
  ];

  it.each(callbacksOnlyChanges)(
    "does not update when only the callbacks are %s",
    (_label, before, after) => {
      const { rerender } = renderOptionsHook(
        { current: mockPicker },
        { ...buildOptions(), callbacks: before },
      );

      rerender({ opts: { ...buildOptions(), callbacks: after } });

      expect(update).not.toHaveBeenCalled();
    },
  );

  it("passes the changed options to update without the callbacks group", () => {
    const onConfirm = vi.fn();
    const { rerender } = renderOptionsHook(
      { current: mockPicker },
      { ui: { theme: "dark" }, callbacks: { onConfirm } },
    );

    rerender({ opts: { ui: { theme: "crane" }, callbacks: { onConfirm } } });

    expect(update).toHaveBeenCalledTimes(1);
    const [[argument]] = update.mock.calls;
    expect(argument).toEqual({
      options: { ui: { theme: "crane" } },
      create: true,
    });
    expect(argument.options).not.toHaveProperty("callbacks");
  });

  it("updates once when options go from undefined to defined", () => {
    const { rerender } = renderOptionsHook({ current: mockPicker }, undefined);

    rerender({ opts: buildOptions() });

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      options: buildOptions(),
      create: true,
    });
  });

  it("does not update when options go from defined to undefined", () => {
    const { rerender } = renderOptionsHook(
      { current: mockPicker },
      buildOptions(),
    );

    rerender({ opts: undefined });

    expect(update).not.toHaveBeenCalled();
  });

  it("updates on a later rerender once the picker exists and the options differ from the mount-time ones", () => {
    const pickerRef: PickerRef = { current: null };
    const { rerender } = renderOptionsHook(pickerRef, buildOptions());

    rerender({ opts: buildChangedOptions() });

    expect(update).not.toHaveBeenCalled();

    pickerRef.current = mockPicker;
    rerender({ opts: buildChangedOptions() });

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      options: buildChangedOptions(),
      create: true,
    });
  });
});
