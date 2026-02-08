import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEventHandlers } from "../hooks/useEventHandlers";
import type { TimepickerInstance } from "../types";

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

describe("useEventHandlers", () => {
  let mockPicker: TimepickerInstance;

  beforeEach(() => {
    mockPicker = createMockPicker();
  });

  it("returns attach and detach functions", () => {
    const { result } = renderHook(() =>
      useEventHandlers({ onConfirm: vi.fn() }, undefined),
    );

    expect(typeof result.current.attachEventHandlers).toBe("function");
    expect(typeof result.current.detachEventHandlers).toBe("function");
  });

  it("attaches onConfirm handler", () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() =>
      useEventHandlers({ onConfirm }, undefined),
    );

    result.current.attachEventHandlers(mockPicker);

    expect(mockPicker.on).toHaveBeenCalledWith("confirm", expect.any(Function));
  });

  it("attaches all event handlers", () => {
    const callbacks = {
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
      onOpen: vi.fn(),
      onUpdate: vi.fn(),
      onSelectHour: vi.fn(),
      onSelectMinute: vi.fn(),
      onSelectAM: vi.fn(),
      onSelectPM: vi.fn(),
      onError: vi.fn(),
      onTimezoneChange: vi.fn(),
      onRangeConfirm: vi.fn(),
      onRangeSwitch: vi.fn(),
      onRangeValidation: vi.fn(),
    };

    const { result } = renderHook(() => useEventHandlers(callbacks, undefined));

    result.current.attachEventHandlers(mockPicker);

    const onCalls = (mockPicker.on as ReturnType<typeof vi.fn>).mock.calls;
    const eventNames = onCalls.map((call) => call[0] as string);

    expect(eventNames).toContain("confirm");
    expect(eventNames).toContain("cancel");
    expect(eventNames).toContain("open");
    expect(eventNames).toContain("update");
    expect(eventNames).toContain("select:hour");
    expect(eventNames).toContain("select:minute");
    expect(eventNames).toContain("select:am");
    expect(eventNames).toContain("select:pm");
    expect(eventNames).toContain("error");
    expect(eventNames).toContain("timezone:change");
    expect(eventNames).toContain("range:confirm");
    expect(eventNames).toContain("range:switch");
    expect(eventNames).toContain("range:validation");
  });

  it("detaches all event handlers", () => {
    const callbacks = {
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
      onOpen: vi.fn(),
      onUpdate: vi.fn(),
      onSelectHour: vi.fn(),
      onSelectMinute: vi.fn(),
      onSelectAM: vi.fn(),
      onSelectPM: vi.fn(),
      onError: vi.fn(),
      onTimezoneChange: vi.fn(),
      onRangeConfirm: vi.fn(),
      onRangeSwitch: vi.fn(),
      onRangeValidation: vi.fn(),
    };

    const { result } = renderHook(() => useEventHandlers(callbacks, undefined));

    result.current.detachEventHandlers(mockPicker);

    const offCalls = (mockPicker.off as ReturnType<typeof vi.fn>).mock.calls;
    const eventNames = offCalls.map((call) => call[0] as string);

    expect(eventNames).toContain("confirm");
    expect(eventNames).toContain("cancel");
    expect(eventNames).toContain("open");
    expect(eventNames).toContain("update");
    expect(eventNames).toContain("select:hour");
    expect(eventNames).toContain("select:minute");
    expect(eventNames).toContain("select:am");
    expect(eventNames).toContain("select:pm");
    expect(eventNames).toContain("error");
    expect(eventNames).toContain("timezone:change");
    expect(eventNames).toContain("range:confirm");
    expect(eventNames).toContain("range:switch");
    expect(eventNames).toContain("range:validation");
  });

  it("does not attach handlers when callback is undefined", () => {
    const { result } = renderHook(() => useEventHandlers({}, undefined));

    result.current.attachEventHandlers(mockPicker);

    expect(mockPicker.on).not.toHaveBeenCalled();
  });

  it("merges react callbacks with options callbacks", () => {
    const optsCb = vi.fn();
    const reactCb = vi.fn();

    const { result } = renderHook(() =>
      useEventHandlers({ onConfirm: reactCb }, { onConfirm: optsCb }),
    );

    result.current.attachEventHandlers(mockPicker);

    const onCalls = (mockPicker.on as ReturnType<typeof vi.fn>).mock.calls;
    const confirmCall = onCalls.find((call) => call[0] === "confirm");
    const mergedHandler = confirmCall![1] as (
      data: Record<string, unknown>,
    ) => void;

    mergedHandler({ hour: "10", minutes: "30" });

    expect(optsCb).toHaveBeenCalledWith({ hour: "10", minutes: "30" });
    expect(reactCb).toHaveBeenCalledWith({ hour: "10", minutes: "30" });
  });

  it("options callback fires before react callback", () => {
    const order: string[] = [];
    const optsCb = vi.fn(() => order.push("opts"));
    const reactCb = vi.fn(() => order.push("react"));

    const { result } = renderHook(() =>
      useEventHandlers({ onCancel: reactCb }, { onCancel: optsCb }),
    );

    result.current.attachEventHandlers(mockPicker);

    const onCalls = (mockPicker.on as ReturnType<typeof vi.fn>).mock.calls;
    const cancelCall = onCalls.find((call) => call[0] === "cancel");
    const mergedHandler = cancelCall![1] as (
      data: Record<string, unknown>,
    ) => void;

    mergedHandler({});

    expect(order).toEqual(["opts", "react"]);
  });

  it("works when only options callback is provided", () => {
    const optsCb = vi.fn();

    const { result } = renderHook(() =>
      useEventHandlers({}, { onOpen: optsCb }),
    );

    result.current.attachEventHandlers(mockPicker);

    const onCalls = (mockPicker.on as ReturnType<typeof vi.fn>).mock.calls;
    const openCall = onCalls.find((call) => call[0] === "open");
    const handler = openCall![1] as (data: Record<string, unknown>) => void;

    handler({ hour: "12", minutes: "00" });

    expect(optsCb).toHaveBeenCalled();
  });

  it("handles all callback types from options", () => {
    const optCallbacks = {
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
      onOpen: vi.fn(),
      onUpdate: vi.fn(),
      onSelectHour: vi.fn(),
      onSelectMinute: vi.fn(),
      onSelectAM: vi.fn(),
      onSelectPM: vi.fn(),
      onError: vi.fn(),
      onTimezoneChange: vi.fn(),
      onRangeConfirm: vi.fn(),
      onRangeSwitch: vi.fn(),
      onRangeValidation: vi.fn(),
    };

    const { result } = renderHook(() => useEventHandlers({}, optCallbacks));

    result.current.attachEventHandlers(mockPicker);

    const onCalls = (mockPicker.on as ReturnType<typeof vi.fn>).mock.calls;

    onCalls.forEach((call) => {
      const handler = call[1] as (data: Record<string, unknown>) => void;
      handler({});
    });

    Object.values(optCallbacks).forEach((cb) => {
      expect(cb).toHaveBeenCalled();
    });
  });

  it("handles all react callbacks without options", () => {
    const reactCallbacks = {
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
      onOpen: vi.fn(),
      onUpdate: vi.fn(),
      onSelectHour: vi.fn(),
      onSelectMinute: vi.fn(),
      onSelectAM: vi.fn(),
      onSelectPM: vi.fn(),
      onError: vi.fn(),
      onTimezoneChange: vi.fn(),
      onRangeConfirm: vi.fn(),
      onRangeSwitch: vi.fn(),
      onRangeValidation: vi.fn(),
    };

    const { result } = renderHook(() =>
      useEventHandlers(reactCallbacks, undefined),
    );

    result.current.attachEventHandlers(mockPicker);

    const onCalls = (mockPicker.on as ReturnType<typeof vi.fn>).mock.calls;

    onCalls.forEach((call) => {
      const handler = call[1] as (data: Record<string, unknown>) => void;
      handler({});
    });

    Object.values(reactCallbacks).forEach((cb) => {
      expect(cb).toHaveBeenCalled();
    });
  });

  it("does not detach handlers when callback is undefined", () => {
    const { result } = renderHook(() => useEventHandlers({}, undefined));

    result.current.detachEventHandlers(mockPicker);

    expect(mockPicker.off).not.toHaveBeenCalled();
  });
});
