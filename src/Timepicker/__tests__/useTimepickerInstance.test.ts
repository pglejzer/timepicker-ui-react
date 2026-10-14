import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import { renderHook, act, cleanup, waitFor } from "@testing-library/react";
import type { TimepickerOptions } from "timepicker-ui";

const { isSSR, coreClassReads } = vi.hoisted(() => ({
  isSSR: vi.fn(() => false),
  coreClassReads: vi.fn(),
}));

vi.mock("../utils", () => ({ isSSR }));

vi.mock("timepicker-ui", () => {
  const FakeTimepickerUI = vi.fn(function FakeTimepickerUI(
    _input: HTMLInputElement,
    options?: TimepickerOptions,
  ) {
    return {
      options: { range: { enabled: options?.range?.enabled ?? false } },
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
  });

  return {
    get TimepickerUI() {
      coreClassReads();
      return FakeTimepickerUI;
    },
    EventEmitter: vi.fn(),
    PluginRegistry: { register: vi.fn() },
  };
});

import { TimepickerUI } from "timepicker-ui";
import { useTimepickerInstance } from "../hooks/useTimepickerInstance";

type MockPicker = Record<"create" | "destroy" | "setValue", Mock>;

type InitialValues = { value?: string; defaultValue?: string };

const MockTimepickerUI = TimepickerUI as unknown as Mock;

const createInputRef = (): React.RefObject<HTMLInputElement> => {
  const input = document.createElement("input");
  return { current: input };
};

const mountInstance = (
  options: TimepickerOptions | undefined,
  { value, defaultValue }: InitialValues = {},
) => {
  const inputRef = createInputRef();
  const attach = vi.fn();
  const detach = vi.fn();
  const hook = renderHook(() =>
    useTimepickerInstance(
      inputRef,
      options,
      value,
      defaultValue,
      attach,
      detach,
    ),
  );

  return { ...hook, inputRef, attach, detach };
};

const waitForPicker = async (): Promise<MockPicker> => {
  await waitFor(() => expect(MockTimepickerUI).toHaveBeenCalledTimes(1));
  return MockTimepickerUI.mock.results[0].value as MockPicker;
};

beforeEach(() => {
  vi.clearAllMocks();
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
    expect(MockTimepickerUI).not.toHaveBeenCalled();
  });

  it("exposes the created picker through the returned ref", async () => {
    const { result } = mountInstance(undefined);

    const picker = await waitForPicker();

    expect(result.current.current).toBe(picker);
  });

  it("constructs the picker without the callbacks group and keeps the other groups", async () => {
    const options: TimepickerOptions = {
      clock: { type: "24h" },
      ui: { theme: "dark" },
      callbacks: { onConfirm: vi.fn() },
    };
    const { inputRef } = mountInstance(options);

    await waitForPicker();

    const [element, passedOptions] = MockTimepickerUI.mock.calls[0];
    expect(element).toBe(inputRef.current);
    expect(passedOptions).toEqual({
      clock: { type: "24h" },
      ui: { theme: "dark" },
    });
    expect(passedOptions).not.toHaveProperty("callbacks");
  });

  it("passes undefined options to the constructor as undefined", async () => {
    const { inputRef } = mountInstance(undefined);

    await waitForPicker();

    const [element, passedOptions] = MockTimepickerUI.mock.calls[0];
    expect(element).toBe(inputRef.current);
    expect(passedOptions).toBeUndefined();
  });

  it("attaches handlers before create()", async () => {
    const { attach } = mountInstance(undefined);

    const picker = await waitForPicker();

    expect(attach).toHaveBeenCalledTimes(1);
    expect(attach).toHaveBeenCalledWith(picker);
    expect(picker.create).toHaveBeenCalledTimes(1);
    expect(attach.mock.invocationCallOrder[0]).toBeLessThan(
      picker.create.mock.invocationCallOrder[0],
    );
  });

  const seedCases: Array<[string, InitialValues, string]> = [
    ["value", { value: "10:30" }, "10:30"],
    ["defaultValue", { defaultValue: "09:15" }, "09:15"],
    [
      "value over defaultValue",
      { value: "10:30", defaultValue: "09:15" },
      "10:30",
    ],
  ];

  it.each(seedCases)(
    "seeds %s after create()",
    async (_label, initialValues, expected) => {
      mountInstance(undefined, initialValues);

      const picker = await waitForPicker();

      expect(picker.setValue).toHaveBeenCalledTimes(1);
      expect(picker.setValue).toHaveBeenCalledWith(expected, true);
      expect(picker.create.mock.invocationCallOrder[0]).toBeLessThan(
        picker.setValue.mock.invocationCallOrder[0],
      );
    },
  );

  it("does not seed a value without value or defaultValue", async () => {
    mountInstance(undefined);

    const picker = await waitForPicker();

    expect(picker.setValue).not.toHaveBeenCalled();
  });

  it("does not seed a value on a range picker", async () => {
    mountInstance(
      { range: { enabled: true } },
      { value: "10:00 AM - 11:00 AM" },
    );

    const picker = await waitForPicker();

    expect(picker.create).toHaveBeenCalledTimes(1);
    expect(picker.setValue).not.toHaveBeenCalled();
  });

  it("does not create a picker during SSR", async () => {
    isSSR.mockReturnValueOnce(true);
    const server = mountInstance(undefined);
    const client = mountInstance(undefined);

    const picker = await waitForPicker();

    expect(isSSR).toHaveBeenCalledTimes(2);
    expect(MockTimepickerUI.mock.calls[0][0]).toBe(client.inputRef.current);
    expect(server.attach).not.toHaveBeenCalled();
    expect(server.result.current.current).toBeNull();
    expect(client.attach).toHaveBeenCalledWith(picker);
  });

  it("detaches handlers and then destroys the picker on unmount", async () => {
    const { result, unmount, detach } = mountInstance(undefined);
    const picker = await waitForPicker();

    unmount();

    expect(detach).toHaveBeenCalledWith(picker);
    expect(picker.destroy).toHaveBeenCalledTimes(1);
    expect(detach.mock.invocationCallOrder[0]).toBeLessThan(
      picker.destroy.mock.invocationCallOrder[0],
    );
    expect(result.current.current).toBeNull();
  });

  it("does not create a picker when unmounted before the core import resolves", async () => {
    const { result, unmount, attach } = mountInstance(undefined);

    unmount();
    expect(coreClassReads).not.toHaveBeenCalled();

    await waitFor(() => expect(coreClassReads).toHaveBeenCalledTimes(1));

    expect(MockTimepickerUI).not.toHaveBeenCalled();
    expect(attach).not.toHaveBeenCalled();
    expect(result.current.current).toBeNull();
  });
});
