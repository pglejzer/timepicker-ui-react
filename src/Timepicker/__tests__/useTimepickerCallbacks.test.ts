import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTimepickerCallbacks } from "../hooks/useTimepickerCallbacks";
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

describe("useTimepickerCallbacks", () => {
  let mockPicker: TimepickerInstance;

  beforeEach(() => {
    mockPicker = createMockPicker();
  });

  it("attaches handlers when picker is available", () => {
    const pickerRef = { current: mockPicker };
    const attach = vi.fn();
    const detach = vi.fn();

    renderHook(() =>
      useTimepickerCallbacks(pickerRef, attach, detach, { onConfirm: vi.fn() }),
    );

    expect(detach).toHaveBeenCalledWith(mockPicker);
    expect(attach).toHaveBeenCalledWith(mockPicker);
  });

  it("does not attach handlers when picker is null", () => {
    const pickerRef = { current: null };
    const attach = vi.fn();
    const detach = vi.fn();

    renderHook(() =>
      useTimepickerCallbacks(pickerRef, attach, detach, { onConfirm: vi.fn() }),
    );

    expect(attach).not.toHaveBeenCalled();
    expect(detach).not.toHaveBeenCalled();
  });

  it("re-attaches when callbacks change", () => {
    const pickerRef = { current: mockPicker };
    const attach = vi.fn();
    const detach = vi.fn();
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const { rerender } = renderHook(
      ({ callbacks }) =>
        useTimepickerCallbacks(pickerRef, attach, detach, callbacks),
      { initialProps: { callbacks: { onConfirm: cb1 } } },
    );

    attach.mockClear();
    detach.mockClear();

    rerender({ callbacks: { onConfirm: cb2 } });

    expect(detach).toHaveBeenCalled();
    expect(attach).toHaveBeenCalled();
  });

  it("detaches on unmount", () => {
    const pickerRef = { current: mockPicker };
    const attach = vi.fn();
    const detach = vi.fn();

    const { unmount } = renderHook(() =>
      useTimepickerCallbacks(pickerRef, attach, detach, { onConfirm: vi.fn() }),
    );

    detach.mockClear();

    unmount();

    expect(detach).toHaveBeenCalledWith(mockPicker);
  });

  it("handles all callback types in dependencies", () => {
    const pickerRef = { current: mockPicker };
    const attach = vi.fn();
    const detach = vi.fn();

    const allCallbacks = {
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

    const { rerender } = renderHook(
      ({ callbacks }) =>
        useTimepickerCallbacks(pickerRef, attach, detach, callbacks),
      { initialProps: { callbacks: allCallbacks } },
    );

    attach.mockClear();
    detach.mockClear();

    rerender({
      callbacks: { ...allCallbacks, onCancel: vi.fn() },
    });

    expect(detach).toHaveBeenCalled();
    expect(attach).toHaveBeenCalled();
  });

  it("handles unmount when pickerRef.current becomes null", () => {
    const pickerRef: { current: TimepickerInstance | null } = {
      current: mockPicker,
    };
    const attach = vi.fn();
    const detach = vi.fn();

    const { unmount } = renderHook(() =>
      useTimepickerCallbacks(pickerRef, attach, detach, { onConfirm: vi.fn() }),
    );

    detach.mockClear();
    pickerRef.current = null;

    unmount();

    expect(detach).not.toHaveBeenCalled();
  });
});
