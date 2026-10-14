import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEventHandlers } from "../hooks/useEventHandlers";
import { CALLBACK_EVENTS } from "../callbacks";
import type { CallbackName, ReactCallbacks } from "../callbacks";
import type { TimepickerInstance } from "../types";

type Handler = (data: unknown) => void;

const CORE_CALLBACK_EVENTS: Array<[CallbackName, string]> = [
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
];

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

const createAllCallbacks = (): Record<CallbackName, Mock> =>
  Object.fromEntries(
    CALLBACK_EVENTS.map(([name]) => [name, vi.fn()]),
  ) as Record<CallbackName, Mock>;

const callsOf = (method: unknown): Array<[string, Handler]> =>
  (method as Mock).mock.calls as Array<[string, Handler]>;

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

  it("keeps the callback table in line with the core callback bridge", () => {
    expect(CALLBACK_EVENTS).toEqual(CORE_CALLBACK_EVENTS);
  });

  describe("attaching", () => {
    it("attaches one handler per callback event in table order", () => {
      const callbacks = createAllCallbacks();
      const { result } = renderHook(() =>
        useEventHandlers(callbacks, undefined),
      );

      result.current.attachEventHandlers(mockPicker);

      const eventNames = callsOf(mockPicker.on).map(([event]) => event);
      expect(eventNames).toEqual(CALLBACK_EVENTS.map(([, event]) => event));
      expect(eventNames).toHaveLength(21);
      expect(eventNames).toEqual(
        expect.arrayContaining([
          "show",
          "select:second",
          "switch:view",
          "wheel:scroll:start",
          "wheel:scroll:end",
          "clear",
        ]),
      );
    });

    it.each(CORE_CALLBACK_EVENTS)(
      "routes %s to the %s event",
      (name, event) => {
        const callback = vi.fn();
        const callbacks: ReactCallbacks = { [name]: callback };
        const { result } = renderHook(() =>
          useEventHandlers(callbacks, undefined),
        );

        result.current.attachEventHandlers(mockPicker);

        const calls = callsOf(mockPicker.on);
        expect(calls).toHaveLength(1);
        const [[attachedEvent, handler]] = calls;
        expect(attachedEvent).toBe(event);

        handler({ event });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({ event });
      },
    );

    it.each([
      ["no options callbacks", undefined],
      ["an empty options callbacks object", {}],
    ])("attaches nothing with no React callbacks and %s", (_label, opts) => {
      const { result } = renderHook(() => useEventHandlers({}, opts));

      result.current.attachEventHandlers(mockPicker);

      expect(mockPicker.on).not.toHaveBeenCalled();
    });
  });

  describe("detaching", () => {
    it("detaches every handler with the same reference it attached", () => {
      const callbacks = createAllCallbacks();
      const { result } = renderHook(() =>
        useEventHandlers(callbacks, undefined),
      );

      result.current.attachEventHandlers(mockPicker);
      result.current.detachEventHandlers(mockPicker);

      const onCalls = callsOf(mockPicker.on);
      const offCalls = callsOf(mockPicker.off);
      expect(offCalls).toHaveLength(CALLBACK_EVENTS.length);
      offCalls.forEach(([event, handler], index) => {
        expect(event).toBe(onCalls[index][0]);
        expect(handler).toBe(onCalls[index][1]);
      });
    });

    it("does not call off when nothing was attached", () => {
      const callbacks = createAllCallbacks();
      const { result } = renderHook(() =>
        useEventHandlers(callbacks, undefined),
      );

      result.current.detachEventHandlers(mockPicker);

      expect(mockPicker.off).not.toHaveBeenCalled();
    });

    it("makes a second detach a no-op", () => {
      const callbacks = createAllCallbacks();
      const { result } = renderHook(() =>
        useEventHandlers(callbacks, undefined),
      );

      result.current.attachEventHandlers(mockPicker);
      result.current.detachEventHandlers(mockPicker);
      (mockPicker.off as unknown as Mock).mockClear();

      result.current.detachEventHandlers(mockPicker);

      expect(mockPicker.off).not.toHaveBeenCalled();
    });

    it("detaches the handlers of the last attach after a rerender with a new callback", () => {
      const first = vi.fn();
      const second = vi.fn();
      const { result, rerender } = renderHook(
        ({ onConfirm }) => useEventHandlers({ onConfirm }, undefined),
        { initialProps: { onConfirm: first } },
      );

      result.current.attachEventHandlers(mockPicker);
      const [[, attachedHandler]] = callsOf(mockPicker.on);

      rerender({ onConfirm: second });
      result.current.detachEventHandlers(mockPicker);

      expect(callsOf(mockPicker.off)).toEqual([["confirm", attachedHandler]]);
    });
  });

  describe("merging", () => {
    it("calls the options callback before the React prop with the same payload", () => {
      const order: string[] = [];
      const fromOptions = vi.fn(() => order.push("options"));
      const fromReact = vi.fn(() => order.push("react"));
      const payload = { hour: "10", minutes: "30" };
      const { result } = renderHook(() =>
        useEventHandlers({ onConfirm: fromReact }, { onConfirm: fromOptions }),
      );

      result.current.attachEventHandlers(mockPicker);
      const calls = callsOf(mockPicker.on);
      expect(calls).toHaveLength(1);
      const [[, handler]] = calls;

      handler(payload);

      expect(order).toEqual(["options", "react"]);
      expect(fromOptions).toHaveBeenCalledWith(payload);
      expect(fromReact).toHaveBeenCalledWith(payload);
    });

    it("invokes the options callback when no React prop is given", () => {
      const fromOptions = vi.fn();
      const { result } = renderHook(() =>
        useEventHandlers({}, { onOpen: fromOptions }),
      );

      result.current.attachEventHandlers(mockPicker);
      const [[event, handler]] = callsOf(mockPicker.on);
      handler({ hour: "12" });

      expect(event).toBe("open");
      expect(fromOptions).toHaveBeenCalledWith({ hour: "12" });
    });

    it("invokes the React prop when no options callback is given", () => {
      const fromReact = vi.fn();
      const { result } = renderHook(() =>
        useEventHandlers({ onOpen: fromReact }, undefined),
      );

      result.current.attachEventHandlers(mockPicker);
      const [[event, handler]] = callsOf(mockPicker.on);
      handler({ hour: "12" });

      expect(event).toBe("open");
      expect(fromReact).toHaveBeenCalledWith({ hour: "12" });
    });

    it("invokes every options callback through its handler", () => {
      const optionsCallbacks = createAllCallbacks();
      const { result } = renderHook(() =>
        useEventHandlers({}, optionsCallbacks),
      );

      result.current.attachEventHandlers(mockPicker);
      callsOf(mockPicker.on).forEach(([, handler]) => handler({}));

      Object.values(optionsCallbacks).forEach((callback) => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("identity", () => {
    const renderWithCallbacks = (callbacks: ReactCallbacks) =>
      renderHook(
        ({ reactCallbacks }) => useEventHandlers(reactCallbacks, undefined),
        { initialProps: { reactCallbacks: callbacks } },
      );

    it("keeps attachEventHandlers when a new callbacks object holds the same functions", () => {
      const callbacks = createAllCallbacks();
      const { result, rerender } = renderWithCallbacks(callbacks);
      const initialAttach = result.current.attachEventHandlers;

      rerender({ reactCallbacks: { ...callbacks } });

      expect(result.current.attachEventHandlers).toBe(initialAttach);
    });

    it.each([
      "onShow",
      "onSelectSecond",
      "onSwitchView",
      "onWheelScrollStart",
      "onWheelScrollEnd",
      "onClear",
    ] as const)("changes attachEventHandlers when %s changes", (name) => {
      const callbacks = createAllCallbacks();
      const { result, rerender } = renderWithCallbacks(callbacks);
      const initialAttach = result.current.attachEventHandlers;

      rerender({ reactCallbacks: { ...callbacks, [name]: vi.fn() } });

      expect(result.current.attachEventHandlers).not.toBe(initialAttach);
    });

    it("changes attachEventHandlers when the options callbacks object changes", () => {
      const onConfirm = vi.fn();
      const { result, rerender } = renderHook(
        ({ optionsCallbacks }) => useEventHandlers({}, optionsCallbacks),
        { initialProps: { optionsCallbacks: { onConfirm } } },
      );
      const initialAttach = result.current.attachEventHandlers;

      rerender({ optionsCallbacks: { onConfirm } });

      expect(result.current.attachEventHandlers).not.toBe(initialAttach);
    });

    it("keeps detachEventHandlers stable across rerenders", () => {
      const callbacks = createAllCallbacks();
      const { result, rerender } = renderWithCallbacks(callbacks);
      const initialDetach = result.current.detachEventHandlers;

      rerender({ reactCallbacks: createAllCallbacks() });

      expect(result.current.detachEventHandlers).toBe(initialDetach);
    });
  });
});
