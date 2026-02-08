import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTimepickerOptions } from "../hooks/useTimepickerOptions";
import type { TimepickerInstance } from "../types";
import type { TimepickerOptions } from "timepicker-ui";

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

describe("useTimepickerOptions", () => {
  let mockPicker: TimepickerInstance;

  beforeEach(() => {
    mockPicker = createMockPicker();
  });

  it("calls update when options are provided", () => {
    const pickerRef = { current: mockPicker };
    const options: TimepickerOptions = { clock: { type: "24h" } };

    renderHook(() => useTimepickerOptions(pickerRef, options));

    expect(mockPicker.update).toHaveBeenCalledWith({
      options,
      create: true,
    });
  });

  it("does not call update when options is undefined", () => {
    const pickerRef = { current: mockPicker };

    renderHook(() => useTimepickerOptions(pickerRef, undefined));

    expect(mockPicker.update).not.toHaveBeenCalled();
  });

  it("does not call update when picker is null", () => {
    const pickerRef = { current: null };
    const options: TimepickerOptions = { clock: { type: "12h" } };

    renderHook(() => useTimepickerOptions(pickerRef, options));

    expect(mockPicker.update).not.toHaveBeenCalled();
  });

  it("calls update again when options change", () => {
    const pickerRef = { current: mockPicker };
    const options1: TimepickerOptions = { clock: { type: "12h" } };
    const options2: TimepickerOptions = { clock: { type: "24h" } };

    const { rerender } = renderHook(
      ({ opts }) => useTimepickerOptions(pickerRef, opts),
      { initialProps: { opts: options1 as TimepickerOptions | undefined } },
    );

    (mockPicker.update as ReturnType<typeof vi.fn>).mockClear();

    rerender({ opts: options2 });

    expect(mockPicker.update).toHaveBeenCalledWith({
      options: options2,
      create: true,
    });
  });
});
