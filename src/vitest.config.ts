import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["Timepicker/**/*.{ts,tsx}"],
      exclude: [
        "Timepicker/**/__tests__/**",
        "Timepicker/**/index.ts",
        "Timepicker/hooks/useTimepickerInstance.ts",
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
