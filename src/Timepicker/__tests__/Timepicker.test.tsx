import { describe, it, expect, afterEach } from "vitest";
import React, { createRef } from "react";
import { render, screen, cleanup, act } from "@testing-library/react";
import { Timepicker } from "../Timepicker";

afterEach(cleanup);

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
