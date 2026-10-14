import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { createRef } from "react";
import {
  render,
  screen,
  cleanup,
  act,
  waitFor,
} from "@testing-library/react";
import { Timepicker } from "../Timepicker";
import { CALLBACK_EVENTS } from "../callbacks";
import type { ReactCallbacks } from "../callbacks";

const { FakeTimepickerUI, pickers } = vi.hoisted(() => {
  type Handler = (data: unknown) => void;
  type FakeOptions = {
    callbacks?: Record<string, Handler | undefined>;
    range?: { enabled?: boolean };
  };

  const pickers: FakeTimepickerUI[] = [];

  class FakeTimepickerUI {
    readonly handlers = new Map<string, Set<Handler>>();
    readonly options: {
      callbacks: Record<string, Handler | undefined>;
      range: { enabled: boolean };
    };
    readonly create = vi.fn();
    readonly destroy = vi.fn();
    readonly setValue = vi.fn();
    readonly update = vi.fn();
    readonly on = vi.fn((event: string, handler: Handler) => {
      const registered = this.handlers.get(event) ?? new Set<Handler>();
      registered.add(handler);
      this.handlers.set(event, registered);
    });
    readonly off = vi.fn((event: string, handler: Handler) => {
      this.handlers.get(event)?.delete(handler);
    });

    constructor(
      readonly input: HTMLInputElement,
      readonly passedOptions?: FakeOptions,
    ) {
      this.options = {
        callbacks: { ...passedOptions?.callbacks },
        range: { enabled: passedOptions?.range?.enabled ?? false },
      };
      if (!input.parentElement?.classList.contains("tp-ui")) {
        const wrapper = input.ownerDocument.createElement("div");
        wrapper.className = "tp-ui";
        input.parentNode?.insertBefore(wrapper, input);
        wrapper.appendChild(input);
      }
      pickers.push(this);
    }
  }

  return { FakeTimepickerUI, pickers };
});

vi.mock("timepicker-ui", () => ({
  TimepickerUI: FakeTimepickerUI,
  EventEmitter: vi.fn(),
  PluginRegistry: { register: vi.fn() },
}));

type FakePicker = InstanceType<typeof FakeTimepickerUI>;

const confirmPayload = { hour: "10", minutes: "30" };

const renderPicker = async (ui: React.ReactElement) => {
  const view = render(ui);
  await waitFor(() => expect(pickers).toHaveLength(1));
  return { ...view, picker: pickers[0] };
};

const handlerCount = (picker: FakePicker, event: string): number =>
  picker.handlers.get(event)?.size ?? 0;

const emit = (picker: FakePicker, event: string, data: unknown): void => {
  picker.handlers.get(event)?.forEach((handler) => handler(data));
  const bridged = CALLBACK_EVENTS.find(([, name]) => name === event);
  if (bridged) {
    picker.options.callbacks[bridged[0]]?.(data);
  }
};

beforeEach(() => {
  pickers.length = 0;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Timepicker", () => {
  it("renders an input element", async () => {
    await act(async () => {
      render(<Timepicker placeholder="Select time" />);
    });

    const input = screen.getByPlaceholderText("Select time");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("has displayName set", () => {
    expect(Timepicker.displayName).toBe("Timepicker");
  });

  it("keeps the input in its own tp-ui wrapper once the core is created", async () => {
    const { container } = render(<Timepicker placeholder="wrapped" />);
    const input = screen.getByPlaceholderText("wrapped");
    const ownWrapper = input.parentElement;

    await waitFor(() => expect(pickers).toHaveLength(1));

    expect(ownWrapper?.tagName).toBe("DIV");
    expect(ownWrapper).toHaveClass("tp-ui");
    expect(ownWrapper?.parentElement).toBe(container);
    expect(input.parentElement).toBe(ownWrapper);
    expect(container.querySelectorAll(".tp-ui")).toHaveLength(1);
    expect(pickers[0].input).toBe(input);
  });

  it("unmounts conditionally inside a parent that stays mounted", async () => {
    const Host = ({ show }: { show: boolean }) => (
      <div data-testid="host">
        {show && <Timepicker placeholder="conditional" />}
        <span>sibling</span>
      </div>
    );
    const { picker, rerender } = await renderPicker(<Host show />);

    expect(() => rerender(<Host show={false} />)).not.toThrow();

    const host = screen.getByTestId("host");
    expect(host.children).toHaveLength(1);
    expect(host.firstElementChild?.tagName).toBe("SPAN");
    expect(host.textContent).toBe("sibling");
    expect(screen.queryByPlaceholderText("conditional")).toBeNull();
    expect(picker.destroy).toHaveBeenCalledTimes(1);
  });

  it("lets a sibling be inserted before a mounted picker", async () => {
    const Host = ({ showLabel }: { showLabel: boolean }) => (
      <div data-testid="host">
        {showLabel && <span>label</span>}
        <Timepicker placeholder="after-label" />
      </div>
    );
    const { rerender } = await renderPicker(<Host showLabel={false} />);

    expect(() => rerender(<Host showLabel />)).not.toThrow();

    const host = screen.getByTestId("host");
    const input = screen.getByPlaceholderText("after-label");
    expect(host.children).toHaveLength(2);
    expect(host.firstElementChild?.tagName).toBe("SPAN");
    expect(host.lastElementChild).toHaveClass("tp-ui");
    expect(input.parentElement).toBe(host.lastElementChild);
  });

  it("forwards ref to the input element", async () => {
    const ref = createRef<HTMLInputElement>();

    await act(async () => {
      render(<Timepicker ref={ref} placeholder="ref-test" />);
    });

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.placeholder).toBe("ref-test");
  });

  it("spreads native input attributes", async () => {
    await act(async () => {
      render(
        <Timepicker
          placeholder="test"
          className="my-class"
          disabled
          id="time-input"
        />,
      );
    });

    const input = screen.getByPlaceholderText("test");
    expect(input).toHaveClass("my-class");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("id", "time-input");
  });

  it("renders as uncontrolled with defaultValue", async () => {
    await act(async () => {
      render(<Timepicker defaultValue="09:30" placeholder="uncontrolled" />);
    });

    const input = screen.getByPlaceholderText("uncontrolled");
    expect(input).toHaveAttribute("value", "09:30");
    expect(input).not.toHaveAttribute("readonly");
  });

  it("renders as controlled with value and readOnly", async () => {
    await act(async () => {
      render(<Timepicker value="14:00" placeholder="controlled" />);
    });

    const input = screen.getByPlaceholderText("controlled");
    expect(input).toHaveAttribute("value", "14:00");
    expect(input).toHaveAttribute("readonly");
  });
});

describe("Timepicker callback props", () => {
  it("keeps every callback prop off the input element", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const callbacks: ReactCallbacks = Object.fromEntries(
      CALLBACK_EVENTS.map(([name]) => [name, vi.fn()]),
    );

    await renderPicker(<Timepicker placeholder="callbacks" {...callbacks} />);

    const input = screen.getByPlaceholderText("callbacks");
    CALLBACK_EVENTS.forEach(([name]) => {
      expect(input).not.toHaveAttribute(name);
    });
    expect(consoleError).not.toHaveBeenCalled();
  });

  it.each([
    ["onShow", "show"],
    ["onSelectSecond", "select:second"],
    ["onSwitchView", "switch:view"],
    ["onWheelScrollStart", "wheel:scroll:start"],
    ["onWheelScrollEnd", "wheel:scroll:end"],
  ] as const)("calls %s when the core emits %s", async (name, event) => {
    const callback = vi.fn();
    const callbacks: ReactCallbacks = { [name]: callback };
    const payload = { event };

    const { picker } = await renderPicker(<Timepicker {...callbacks} />);
    emit(picker, event, payload);

    expect(handlerCount(picker, event)).toBe(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(payload);
  });

  it("fires options.callbacks.onConfirm and the onConfirm prop once each per confirm", async () => {
    const fromOptions = vi.fn();
    const fromProp = vi.fn();

    const { picker } = await renderPicker(
      <Timepicker
        options={{ callbacks: { onConfirm: fromOptions } }}
        onConfirm={fromProp}
      />,
    );
    emit(picker, "confirm", confirmPayload);

    expect(picker.passedOptions).not.toHaveProperty("callbacks");
    expect(fromOptions).toHaveBeenCalledTimes(1);
    expect(fromOptions).toHaveBeenCalledWith(confirmPayload);
    expect(fromProp).toHaveBeenCalledTimes(1);
    expect(fromProp).toHaveBeenCalledWith(confirmPayload);
  });

  it("keeps a single confirm handler after rerenders with a new inline onConfirm", async () => {
    const confirmed = vi.fn();
    const Parent = ({ label }: { label: string }) => (
      <Timepicker onConfirm={(data) => confirmed(label, data)} />
    );

    const { picker, rerender } = await renderPicker(<Parent label="first" />);
    rerender(<Parent label="second" />);
    rerender(<Parent label="third" />);

    expect(handlerCount(picker, "confirm")).toBe(1);

    emit(picker, "confirm", confirmPayload);

    expect(confirmed).toHaveBeenCalledTimes(1);
    expect(confirmed).toHaveBeenCalledWith("third", confirmPayload);
  });
});

describe("Timepicker options", () => {
  it("never updates the picker when parent renders pass equal inline options", async () => {
    const Parent = () => (
      <Timepicker
        options={{
          clock: { type: "24h", disabledTime: { hours: [1, 2] } },
          ui: { theme: "dark" },
          callbacks: { onConfirm: () => undefined },
        }}
      />
    );

    const { picker, rerender } = await renderPicker(<Parent />);
    rerender(<Parent />);
    rerender(<Parent />);

    expect(picker.update).not.toHaveBeenCalled();
    expect(handlerCount(picker, "confirm")).toBe(1);
  });
});

describe("Timepicker value", () => {
  it("seeds the controlled value into the core after create()", async () => {
    const { picker } = await renderPicker(<Timepicker value="14:00" />);

    expect(picker.setValue).toHaveBeenCalledTimes(1);
    expect(picker.setValue).toHaveBeenCalledWith("14:00", true);
    expect(picker.create.mock.invocationCallOrder[0]).toBeLessThan(
      picker.setValue.mock.invocationCallOrder[0],
    );
  });

  it("pushes a changed controlled value into the core and skips an unchanged one", async () => {
    const { picker, rerender } = await renderPicker(
      <Timepicker value="14:00" />,
    );

    rerender(<Timepicker value="15:30" />);
    rerender(<Timepicker value="15:30" />);

    expect(picker.setValue).toHaveBeenCalledTimes(2);
    expect(picker.setValue).toHaveBeenLastCalledWith("15:30", true);
  });

  it("applies an options change before the value change of the same render", async () => {
    const { picker, rerender } = await renderPicker(
      <Timepicker options={{ clock: { type: "12h" } }} value="02:00 PM" />,
    );

    rerender(<Timepicker options={{ clock: { type: "24h" } }} value="14:00" />);

    expect(picker.update).toHaveBeenCalledTimes(1);
    expect(picker.update).toHaveBeenCalledWith({
      options: { clock: { type: "24h" } },
      create: true,
    });
    expect(picker.setValue).toHaveBeenLastCalledWith("14:00", true);
    expect(picker.update.mock.invocationCallOrder[0]).toBeLessThan(
      picker.setValue.mock.invocationCallOrder[1],
    );
  });

  it("never passes a range value to setValue", async () => {
    const { picker, rerender } = await renderPicker(
      <Timepicker options={{ range: { enabled: true } }} value="10:00 - 11:00" />,
    );

    rerender(
      <Timepicker options={{ range: { enabled: true } }} value="12:00 - 13:00" />,
    );

    expect(picker.setValue).not.toHaveBeenCalled();
    expect(picker.update).not.toHaveBeenCalled();
  });
});
