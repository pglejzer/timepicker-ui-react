import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";

const mockPickerInstance = {
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
};

const MockTimepickerUI = vi.fn().mockImplementation(() => mockPickerInstance);

vi.mock("timepicker-ui", () => ({
  TimepickerUI: vi.fn().mockImplementation(() => ({
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
  })),
  EventEmitter: vi.fn(),
  PluginRegistry: { register: vi.fn() },
}));

import { useTimepickerInstance } from "../hooks/useTimepickerInstance";

const resetMocks = (): void => {
  Object.values(mockPickerInstance).forEach((fn) => {
    if (typeof fn === "function" && "mockClear" in fn) {
      fn.mockClear();
    }
  });
  MockTimepickerUI.mockClear();
};

const createInputRef = (): React.RefObject<HTMLInputElement> => {
  const input = document.createElement("input");
  return { current: input };
};

beforeEach(() => {
  resetMocks();
});

afterEach(cleanup);

describe("useTimepickerInstance", () => {
  it("does not create picker when inputRef.current is null", async () => {
    const inputRef: React.RefObject<HTMLInputElement> = { current: null };
    const attach = vi.fn();
    const detach = vi.fn();

    renderHook(() =>
      useTimepickerInstance(
        inputRef,
        undefined,
        undefined,
        undefined,
        attach,
        detach,
      ),
    );

    await act(async () => {});

    expect(attach).not.toHaveBeenCalled();
  });

  it("returns a ref object", async () => {
    const inputRef = createInputRef();
    const attach = vi.fn();
    const detach = vi.fn();

    const { result } = renderHook(() =>
      useTimepickerInstance(
        inputRef,
        undefined,
        undefined,
        undefined,
        attach,
        detach,
      ),
    );

    await act(async () => {});

    expect(result.current).toHaveProperty("current");
  });
});
