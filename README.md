# timepicker-ui-react

React component for [timepicker-ui](https://github.com/pglejzer/timepicker-ui) v4. It's a thin wrapper: the picker, its options, events and types all come from the core library, and this package only hooks it into React's lifecycle.

[![npm version](https://badge.fury.io/js/timepicker-ui-react.svg)](https://badge.fury.io/js/timepicker-ui-react)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://img.shields.io/npm/l/timepicker-ui-react)
[![downloads](https://img.shields.io/npm/dm/timepicker-ui-react)](https://npmcharts.com/compare/timepicker-ui-react?minimal=true)

[Demo and docs](https://timepicker-ui.vercel.app/react) · [Changelog](./CHANGELOG.md) · [Core library](https://github.com/pglejzer/timepicker-ui)

## Why use it

- No types of its own that could drift out of sync. Everything is re-exported from `timepicker-ui`.
- Controlled (`value`) or uncontrolled (`defaultValue`), like a normal input.
- Accepts any `<input>` prop: `className`, `name`, `disabled`, `aria-*`, ...
- Renders `<div class="tp-ui"><input></div>` on the server and becomes the picker after hydration, so Next.js, Remix and Astro work.
- Range, timezone and wheel plugins work the same as in the core.

## Installation

```bash
npm install timepicker-ui-react
```

Needs React 17 or newer. The package is ESM only.

`timepicker-ui` gets installed with it. With pnpm or Yarn PnP, add `timepicker-ui` (same version) to your own dependencies too, since your code imports its CSS directly.

## Quick start

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

## Props

```tsx
<Timepicker
  options={options}                 // TimepickerOptions, same as the core
  value={time}                      // controlled, the input becomes read-only
  defaultValue="12:00 AM"           // uncontrolled
  onConfirm={(data) => {}}
  onCancel={(data) => {}}
  onOpen={(data) => {}}
  onShow={(data) => {}}
  onUpdate={(data) => {}}
  onSelectHour={(data) => {}}
  onSelectMinute={(data) => {}}
  onSelectSecond={(data) => {}}     // with clock.showSeconds
  onSelectPeriod={(data) => {}}     // data.type is "AM" or "PM"
  onSwitchView={(data) => {}}       // with ui.viewSwitch
  onSwitchFace={(data) => {}}       // data.face: "hours", "minutes" or "seconds"
  onClear={(data) => {}}
  onError={(data) => {}}
  onTimezoneChange={(data) => {}}   // timezone plugin
  onRangeConfirm={(data) => {}}     // range plugin
  onRangeSwitch={(data) => {}}
  onRangeValidation={(data) => {}}
  onWheelScrollStart={(data) => {}} // wheel plugin
  onWheelScrollEnd={(data) => {}}
  className="my-input"              // and any other <input> prop
  placeholder="Select time"
/>
```

`onError` is the picker's error callback, not the DOM `error` event.

Docs: [props](https://timepicker-ui.vercel.app/react), [events](https://timepicker-ui.vercel.app/docs/api/events)

## Options

Same as the core ([full list](https://timepicker-ui.vercel.app/docs/api/options)).

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

Seconds are off by default. With `clock.showSeconds: true` the picker gets a seconds field and values read `HH:MM:SS` (`HH:MM:SS AM` in 12h):

```tsx
<Timepicker options={{ clock: { showSeconds: true } }} />;
```

## Themes

[12 themes](https://timepicker-ui.vercel.app/examples/themes/basic), same as the core. `main.css` is required and already includes `basic`. The others are separate imports:

```tsx
import "timepicker-ui/main.css";
import "timepicker-ui/theme-dark.css";

<Timepicker options={{ ui: { theme: "dark" } }} />;
```

## Plugins

Register them once, before rendering any picker. `PluginRegistry` is re-exported from this package.

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

## Next.js

The component uses hooks, so in the App Router it has to live in a client component:

```tsx
"use client";

import { Timepicker } from "timepicker-ui-react";
import "timepicker-ui/main.css";

export default function Page() {
  return <Timepicker options={{ clock: { type: "12h" } }} />;
}
```

## Types

All core types and the `TimepickerUI`, `EventEmitter` and `PluginRegistry` values are re-exported ([TypeScript docs](https://timepicker-ui.vercel.app/docs/api/typescript)):

```tsx
import type { TimepickerOptions, CallbacksOptions, ConfirmEventData, ... } from "timepicker-ui-react";
import { TimepickerUI, EventEmitter, PluginRegistry } from "timepicker-ui-react";
```

## Development

```bash
cd src
npm run build     # output in ../dist
npm test
npm run dev       # demo on http://localhost:3000
```

## Contributing

Issues and PRs welcome on [GitHub](https://github.com/pglejzer/timepicker-ui-react/issues).

## License

MIT © [Piotr Glejzer](https://github.com/pglejzer)
