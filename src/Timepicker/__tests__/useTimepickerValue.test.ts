import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTimepickerValue } from "../hooks/useTimepickerValue";
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

describe("useTimepickerValue", () => {
  let mockPicker: TimepickerInstance;

  beforeEach(() => {
    mockPicker = createMockPicker();
  });

  it("calls setValue when value is provided", () => {
    const pickerRef = { current: mockPicker };

    renderHook(() => useTimepickerValue(pickerRef, "12:00"));

    expect(mockPicker.setValue).toHaveBeenCalledWith("12:00", true);
  });

  it("does not call setValue when value is undefined", () => {
    const pickerRef = { current: mockPicker };

    renderHook(() => useTimepickerValue(pickerRef, undefined));

    expect(mockPicker.setValue).not.toHaveBeenCalled();
  });

  it("does not call setValue when picker is null", () => {
    const pickerRef = { current: null };

    renderHook(() => useTimepickerValue(pickerRef, "12:00"));

    expect(mockPicker.setValue).not.toHaveBeenCalled();
  });

  it("does not call setValue when value has not changed", () => {
    const pickerRef = { current: mockPicker };

    const { rerender } = renderHook(
      ({ value }) => useTimepickerValue(pickerRef, value),
      { initialProps: { value: "10:00" as string | undefined } },
    );

    expect(mockPicker.setValue).toHaveBeenCalledTimes(1);
    (mockPicker.setValue as ReturnType<typeof vi.fn>).mockClear();

    rerender({ value: "10:00" });

    expect(mockPicker.setValue).not.toHaveBeenCalled();
  });

  it("calls setValue when value changes", () => {
    const pickerRef = { current: mockPicker };

    const { rerender } = renderHook(
      ({ value }) => useTimepickerValue(pickerRef, value),
      { initialProps: { value: "10:00" as string | undefined } },
    );

    (mockPicker.setValue as ReturnType<typeof vi.fn>).mockClear();

    rerender({ value: "11:00" });

    expect(mockPicker.setValue).toHaveBeenCalledWith("11:00", true);
  });
});
