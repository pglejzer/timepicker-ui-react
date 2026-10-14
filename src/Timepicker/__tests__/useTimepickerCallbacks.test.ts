import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTimepickerCallbacks } from "../hooks/useTimepickerCallbacks";
import { useEventHandlers } from "../hooks/useEventHandlers";
import type { TimepickerInstance } from "../types";

type Handler = (data: unknown) => void;

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

const callsOf = (method: unknown): Array<[string, Handler]> =>
  (method as Mock).mock.calls as Array<[string, Handler]>;

describe("useTimepickerCallbacks", () => {
  let mockPicker: TimepickerInstance;

  beforeEach(() => {
    mockPicker = createMockPicker();
  });

  it("detaches then attaches when the picker is available", () => {
    const pickerRef = { current: mockPicker };
    const attach = vi.fn();
    const detach = vi.fn();

    renderHook(() => useTimepickerCallbacks(pickerRef, attach, detach));

    expect(detach).toHaveBeenCalledWith(mockPicker);
    expect(attach).toHaveBeenCalledWith(mockPicker);
    expect(detach.mock.invocationCallOrder[0]).toBeLessThan(
      attach.mock.invocationCallOrder[0],
    );
  });

  it("does not attach handlers when picker is null", () => {
    const pickerRef = { current: null };
    const attach = vi.fn();
    const detach = vi.fn();

    renderHook(() => useTimepickerCallbacks(pickerRef, attach, detach));

    expect(attach).not.toHaveBeenCalled();
    expect(detach).not.toHaveBeenCalled();
  });

  it("detaches and then re-attaches when the attach function changes", () => {
    const pickerRef = { current: mockPicker };
    const attach = vi.fn();
    const nextAttach = vi.fn();
    const detach = vi.fn();
    const { rerender } = renderHook(
      ({ attachHandlers }) =>
        useTimepickerCallbacks(pickerRef, attachHandlers, detach),
      { initialProps: { attachHandlers: attach } },
    );

    attach.mockClear();
    detach.mockClear();

    rerender({ attachHandlers: nextAttach });

    expect(attach).not.toHaveBeenCalled();
    expect(detach).toHaveBeenCalledWith(mockPicker);
    expect(nextAttach).toHaveBeenCalledTimes(1);
    expect(nextAttach).toHaveBeenCalledWith(mockPicker);
    expect(Math.max(...detach.mock.invocationCallOrder)).toBeLessThan(
      nextAttach.mock.invocationCallOrder[0],
    );
  });

  it("does nothing when rerendered with the same functions", () => {
    const pickerRef = { current: mockPicker };
    const attach = vi.fn();
    const detach = vi.fn();
    const { rerender } = renderHook(() =>
      useTimepickerCallbacks(pickerRef, attach, detach),
    );

    attach.mockClear();
    detach.mockClear();

    rerender();

    expect(attach).not.toHaveBeenCalled();
    expect(detach).not.toHaveBeenCalled();
  });

  it("detaches on unmount", () => {
    const pickerRef = { current: mockPicker };
    const attach = vi.fn();
    const detach = vi.fn();
    const { unmount } = renderHook(() =>
      useTimepickerCallbacks(pickerRef, attach, detach),
    );

    detach.mockClear();

    unmount();

    expect(detach).toHaveBeenCalledWith(mockPicker);
  });

  it("handles unmount when pickerRef.current becomes null", () => {
    const pickerRef: { current: TimepickerInstance | null } = {
      current: mockPicker,
    };
    const attach = vi.fn();
    const detach = vi.fn();
    const { unmount } = renderHook(() =>
      useTimepickerCallbacks(pickerRef, attach, detach),
    );

    detach.mockClear();
    pickerRef.current = null;

    unmount();

    expect(detach).not.toHaveBeenCalled();
  });

  it("swaps the clear handler when onClear changes, composed with useEventHandlers", () => {
    const pickerRef = { current: mockPicker };
    const firstClear = vi.fn();
    const secondClear = vi.fn();
    const { rerender } = renderHook(
      ({ onClear }) => {
        const { attachEventHandlers, detachEventHandlers } = useEventHandlers(
          { onClear },
          undefined,
        );
        useTimepickerCallbacks(
          pickerRef,
          attachEventHandlers,
          detachEventHandlers,
        );
      },
      { initialProps: { onClear: firstClear } },
    );

    const [[, firstHandler]] = callsOf(mockPicker.on);

    rerender({ onClear: secondClear });

    expect(callsOf(mockPicker.off)).toEqual([["clear", firstHandler]]);
    const onCalls = callsOf(mockPicker.on);
    expect(onCalls).toHaveLength(2);
    const [, [event, secondHandler]] = onCalls;
    expect(event).toBe("clear");
    expect(secondHandler).not.toBe(firstHandler);

    secondHandler({});

    expect(secondClear).toHaveBeenCalledTimes(1);
    expect(firstClear).not.toHaveBeenCalled();
  });
});
