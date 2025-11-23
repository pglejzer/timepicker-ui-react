import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["Timepicker/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: false,
  clean: true,
  minify: true,
  treeshake: true,
  splitting: false,
  shims: false,
  external: ["react", "react-dom", "timepicker-ui"],
  outDir: "../dist",
  ignoreWatch: ["../dist"],
  esbuildOptions(options) {
    options.drop = ["console", "debugger"];
  },
});
