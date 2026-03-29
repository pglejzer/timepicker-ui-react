# timepicker-ui-react

Official React wrapper for [timepicker-ui](https://github.com/pglejzer/timepicker-ui) v4.x - clock & wheel time picker, full TypeScript, SSR-safe.

[![npm version](https://badge.fury.io/js/timepicker-ui-react.svg)](https://badge.fury.io/js/timepicker-ui-react)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://img.shields.io/npm/l/timepicker-ui-react)
[![downloads](https://img.shields.io/npm/dm/timepicker-ui-react)](https://npmcharts.com/compare/timepicker-ui-react?minimal=true)

[Live Demo](https://timepicker-ui.vercel.app/react) • [Documentation](https://timepicker-ui.vercel.app/react) • [Changelog](./CHANGELOG.md) • [Core Library](https://github.com/pglejzer/timepicker-ui)

## Why timepicker-ui-react?

- **Thin wrapper** - all power comes from the battle-tested timepicker-ui core
- **Zero type duplication** - types re-exported directly from `timepicker-ui`
- **SSR-safe** - works in Next.js, Remix, Astro out of the box
- **Controlled & uncontrolled** - both `value` and `defaultValue` patterns
- **All input props** - extends `InputHTMLAttributes`, pass anything directly
- **Plugin support** - Timezone, Range, Wheel via `PluginRegistry`

## Installation

```bash
npm install timepicker-ui-react
```

> `timepicker-ui` is included as a dependency - no need to install it separately.

## Quick Start

```tsx
import { Timepicker } from "timepicker-ui-react";
import "timepicker-ui/main.css";

function App() {
  return (
    <Timepicker
      placeholder="Select time"
      onConfirm={(data) => console.log("Selected:", data)}
    />
  );
}
```

## API

Full reference: [Props](https://timepicker-ui.vercel.app/react) · [Options](https://timepicker-ui.vercel.app/docs/api/options) · [Events](https://timepicker-ui.vercel.app/docs/api/events) · [TypeScript](https://timepicker-ui.vercel.app/docs/api/typescript)

```tsx
<Timepicker
  // Configuration
  options={options} // TimepickerOptions
  value={time} // controlled
  defaultValue="12:00 AM" // uncontrolled
  // Callbacks
  onConfirm={(data) => {}}
  onCancel={(data) => {}}
  onOpen={(data) => {}}
  onUpdate={(data) => {}}
  onSelectHour={(data) => {}}
  onSelectMinute={(data) => {}}
  onSelectAM={() => {}}
  onSelectPM={() => {}}
  onClear={(data) => {}}
  onError={(data) => {}}
  // Plugin callbacks
  onTimezoneChange={(data) => {}}
  onRangeConfirm={(data) => {}}
  onRangeSwitch={(data) => {}}
  onRangeValidation={(data) => {}}
  // Any standard <input> prop
  className="my-input"
  placeholder="Select time"
  disabled={false}
  id="timepicker-1"
/>
```

## Options Overview

Same options as timepicker-ui core. Full reference: [Options docs](https://timepicker-ui.vercel.app/docs/api/options) · [Configuration guide](https://timepicker-ui.vercel.app/docs/configuration)

```tsx
<Timepicker
  options={{
    clock: { type: "24h", autoSwitchToMinutes: true },
    ui: { theme: "m3-green", mode: "clock", clearButton: true },
    labels: { ok: "Confirm", cancel: "Close" },
    behavior: { focusTrap: true },
    wheel: { placement: "auto", commitOnScroll: false },
  }}
/>
```

## Themes

Same 10 themes as core. [Browse all](https://timepicker-ui.vercel.app/docs/features/themes) · [Live examples](https://timepicker-ui.vercel.app/examples/themes/basic)

Available: `basic`, `crane`, `crane-straight`, `m3-green`, `m2`, `dark`, `glassmorphic`, `pastel`, `ai`, `cyberpunk`

```tsx
import "timepicker-ui/main.css";
import "timepicker-ui/theme-dark.css";

<Timepicker options={{ ui: { theme: "dark" } }} />;
```

## Plugins

Docs: [Plugins overview](https://timepicker-ui.vercel.app/docs/features/plugins) · Examples: [Range](https://timepicker-ui.vercel.app/examples/plugins/range) · [Timezone](https://timepicker-ui.vercel.app/examples/plugins/timezone) · [Wheel](https://timepicker-ui.vercel.app/examples/plugins/wheel)

```tsx
import { PluginRegistry } from "timepicker-ui-react";
import { RangePlugin } from "timepicker-ui/plugins/range";
import { TimezonePlugin } from "timepicker-ui/plugins/timezone";
import { WheelPlugin } from "timepicker-ui/plugins/wheel";

PluginRegistry.register(RangePlugin);
PluginRegistry.register(TimezonePlugin);
PluginRegistry.register(WheelPlugin);

<Timepicker options={{ ui: { mode: "wheel" } }} />
<Timepicker options={{ range: { enabled: true } }} onRangeConfirm={(data) => {}} />
<Timepicker options={{ timezone: { enabled: true } }} onTimezoneChange={(data) => {}} />
```

## SSR / Next.js

```tsx
"use client";

import { Timepicker } from "timepicker-ui-react";
import "timepicker-ui/main.css";

export default function Page() {
  return <Timepicker options={{ clock: { type: "12h" } }} />;
}
```

Renders a plain `<input>` on the server, hydrates with the full picker on the client.

## Exported Types

All types re-exported from `timepicker-ui`. Full list: [TypeScript docs](https://timepicker-ui.vercel.app/docs/api/typescript)

```tsx
import type { TimepickerOptions, CallbacksOptions, ConfirmEventData, ... } from "timepicker-ui-react";
import { TimepickerUI, EventEmitter, PluginRegistry } from "timepicker-ui-react";
```

## Development

```bash
cd src && npm run build        # Build library
cd src/docs && npm run dev     # Run demo
```

## Contributing

Contributions welcome! [Open an issue or PR](https://github.com/pglejzer/timepicker-ui-react/issues).

## License

MIT © [Piotr Glejzer](https://github.com/pglejzer)
