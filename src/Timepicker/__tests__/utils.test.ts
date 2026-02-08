import { describe, it, expect } from "vitest";
import { isSSR } from "../utils";

describe("isSSR", () => {
  it("returns false in jsdom environment", () => {
    expect(isSSR()).toBe(false);
  });

  it("returns true when window is undefined", () => {
    const original = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(isSSR()).toBe(true);

    Object.defineProperty(globalThis, "window", {
      value: original,
      writable: true,
      configurable: true,
    });
  });
});
