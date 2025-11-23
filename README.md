# timepicker-ui-react

Official React wrapper for [timepicker-ui](https://github.com/pglejzer/timepicker-ui) v4.x.

[![npm version](https://badge.fury.io/js/timepicker-ui-react.svg)](https://badge.fury.io/js/timepicker-ui-react)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://img.shields.io/npm/l/timepicker-ui-react)

A lightweight, SSR-safe React component that provides a thin wrapper around the powerful timepicker-ui library with full TypeScript support.

**[View Live Documentation](https://timepicker-ui.vercel.app/react)** • **[Try Interactive Demo](https://timepicker-ui.vercel.app/react/examples)**

## Features

- ✅ **Full TypeScript Support** - All types directly from timepicker-ui core
- ✅ **SSR-Safe** - Works with Next.js, Remix, Gatsby, and other SSR frameworks
- ✅ **Zero Type Duplication** - Re-exports core types, no duplicated interfaces
- ✅ **Event-Driven** - Direct mapping to timepicker-ui's EventEmitter API
- ✅ **Controlled & Uncontrolled** - Support for both value patterns
- ✅ **ESM Only** - Modern, tree-shakeable bundle

## Installation

```bash
npm install timepicker-ui-react
```

```bash
yarn add timepicker-ui-react
```

```bash
pnpm add timepicker-ui-react
```

> **Note:** `timepicker-ui` is automatically installed as a dependency, no need to install it separately.

## Usage

### Basic Example

```tsx
import React from "react";
import { Timepicker } from "timepicker-ui-react";

function App() {
  const handleConfirm = (data) => {
    console.log("Time confirmed:", data);
  };

  return <Timepicker placeholder="Select time" onConfirm={handleConfirm} />;
}
```

### With Options

```tsx
import React from "react";
import { Timepicker, type TimepickerOptions } from "timepicker-ui-react";

function App() {
  const options: TimepickerOptions = {
    clock: {
      type: "24h",
      autoSwitchToMinutes: true,
    },
    ui: {
      theme: "m3-green",
      mobile: false,
    },
    labels: {
      ok: "Confirm",
      cancel: "Close",
    },
  };

  return <Timepicker className="my-timepicker" options={options} />;
}
```

### Controlled Component

```tsx
import React, { useState } from "react";
import { Timepicker } from "timepicker-ui-react";

function App() {
  const [time, setTime] = useState("12:00 AM");

  return (
    <Timepicker
      value={time}
      onUpdate={(data) => {
        setTime(`${data.hour}:${data.minutes} ${data.type}`);
      }}
      onConfirm={(data) => {
        console.log("Confirmed:", data);
      }}
    />
  );
}
```

### With All Callbacks

```tsx
import React from "react";
import { Timepicker } from "timepicker-ui-react";

function App() {
  return (
    <Timepicker
      onOpen={(data) => console.log("Opened:", data)}
      onConfirm={(data) => console.log("Confirmed:", data)}
      onCancel={() => console.log("Cancelled")}
      onUpdate={(data) => console.log("Updated:", data)}
      onSelectHour={(data) => console.log("Hour selected:", data)}
      onSelectMinute={(data) => console.log("Minute selected:", data)}
      onSelectAM={() => console.log("AM selected")}
      onSelectPM={() => console.log("PM selected")}
      onError={(data) => console.log("Error:", data)}
    />
  );
}
```

### SSR (Next.js Example)

```tsx
"use client";

import { Timepicker } from "timepicker-ui-react";

export default function TimepickerPage() {
  return (
    <div>
      <h1>Select Time</h1>
      <Timepicker
        options={{
          clock: { type: "12h" },
          ui: { theme: "m3-green" },
        }}
      />
    </div>
  );
}
```

The component is SSR-safe by default and will render a basic input during server-side rendering, then hydrate with the full timepicker on the client.

## API

### `TimepickerProps`

| Prop             | Type                                 | Description                                |
| ---------------- | ------------------------------------ | ------------------------------------------ |
| `options`        | `TimepickerOptions`                  | Full configuration from timepicker-ui core |
| `value`          | `string`                             | Controlled value                           |
| `defaultValue`   | `string`                             | Default value for uncontrolled usage       |
| `onConfirm`      | `CallbacksOptions['onConfirm']`      | Triggered when user confirms time          |
| `onCancel`       | `CallbacksOptions['onCancel']`       | Triggered when user cancels                |
| `onOpen`         | `CallbacksOptions['onOpen']`         | Triggered when timepicker opens            |
| `onUpdate`       | `CallbacksOptions['onUpdate']`       | Triggered during real-time interaction     |
| `onSelectHour`   | `CallbacksOptions['onSelectHour']`   | Triggered when hour mode is activated      |
| `onSelectMinute` | `CallbacksOptions['onSelectMinute']` | Triggered when minute mode is activated    |
| `onSelectAM`     | `CallbacksOptions['onSelectAM']`     | Triggered when AM is selected              |
| `onSelectPM`     | `CallbacksOptions['onSelectPM']`     | Triggered when PM is selected              |
| `onError`        | `CallbacksOptions['onError']`        | Triggered on validation error              |

The component extends `React.InputHTMLAttributes<HTMLInputElement>`, so all standard input props can be passed directly:

```tsx
<Timepicker
  className="my-input"
  placeholder="Select time"
  disabled={false}
  readOnly={false}
  required={true}
  name="time"
  id="timepicker-1"
  style={{ width: "200px" }}
  // ... any other input props
/>
```

### Exported Types

All types are re-exported from `timepicker-ui` core:

```tsx
import type {
  TimepickerOptions,
  ClockOptions,
  UIOptions,
  LabelsOptions,
  BehaviorOptions,
  CallbacksOptions,
  OptionTypes,
  OpenEventData,
  CancelEventData,
  ConfirmEventData,
  UpdateEventData,
  SelectHourEventData,
  SelectMinuteEventData,
  SelectAMEventData,
  SelectPMEventData,
  ErrorEventData,
  ShowEventData,
  HideEventData,
  SwitchViewEventData,
} from "timepicker-ui-react";
```

## Configuration Options

For detailed documentation on all available options, please refer to the [timepicker-ui documentation](https://github.com/pglejzer/timepicker-ui).

### Quick Reference

```tsx
interface OptionTypes {
  // Clock configuration
  clockType?: "12h" | "24h";
  incrementHours?: number;
  incrementMinutes?: number;
  autoSwitchToMinutes?: boolean;
  disabledTime?: {
    hours?: Array<string | number>;
    minutes?: Array<string | number>;
    interval?: string | string[];
  };
  currentTime?:
    | boolean
    | {
        time?: Date;
        updateInput?: boolean;
        locales?: string | string[];
        preventClockType?: boolean;
      };

  // UI configuration
  theme?:
    | "basic"
    | "crane"
    | "crane-straight"
    | "m2"
    | "m3-green"
    | "dark"
    | "glassmorphic"
    | "pastel"
    | "ai"
    | "cyberpunk";
  animation?: boolean;
  backdrop?: boolean;
  mobile?: boolean;
  enableSwitchIcon?: boolean;
  editable?: boolean;
  enableScrollbar?: boolean;
  cssClass?: string;
  appendModalSelector?: string;
  iconTemplate?: string;
  iconTemplateMobile?: string;
  inline?: {
    enabled: boolean;
    containerId: string;
    showButtons?: boolean;
    autoUpdate?: boolean;
  };

  // Labels
  amLabel?: string;
  pmLabel?: string;
  okLabel?: string;
  cancelLabel?: string;
  timeLabel?: string;
  mobileTimeLabel?: string;
  hourMobileLabel?: string;
  minuteMobileLabel?: string;

  // Behavior
  focusInputAfterCloseModal?: boolean;
  focusTrap?: boolean;
  delayHandler?: number;
  id?: string;

  // Callbacks (use React props instead)
  onOpen?: (data: OpenEventData) => void;
  onCancel?: (data: CancelEventData) => void;
  onConfirm?: (data: ConfirmEventData) => void;
  onUpdate?: (data: UpdateEventData) => void;
  onSelectHour?: (data: SelectHourEventData) => void;
  onSelectMinute?: (data: SelectMinuteEventData) => void;
  onSelectAM?: (data: SelectAMEventData) => void;
  onSelectPM?: (data: SelectPMEventData) => void;
  onError?: (data: ErrorEventData) => void;
}
```

## Architecture

This package follows strict architectural principles:

- **Zero Type Duplication** - All types come directly from `timepicker-ui`
- **SSR-Safe** - Dynamic imports ensure browser-only code runs client-side
- **Event Mapping** - React callbacks map to timepicker-ui's EventEmitter API
- **Composition Over Inheritance** - Clean, maintainable wrapper pattern
- **Modular Hooks** - Separation of concerns with dedicated hooks for instance, events, value, options, and callbacks

## Package Structure

This repository uses a dual-package structure:

```
timepicker-ui-react/
├── src/                    # Library source code
│   ├── Timepicker/
│   │   ├── Timepicker.tsx
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── hooks/
│   └── index.ts
├── docs/                   # Demo application (separate package)
│   ├── package.json        # Demo dependencies
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       └── App.tsx
├── package.json            # Main library package
└── tsup.config.ts          # Build configuration
```

### Main Package

- Production-ready build configuration
- Only essential dependencies (tsup, typescript, @types/\*)
- Exports ESM bundle with TypeScript definitions

### Demo Package

- Separate Vite dev server for live testing
- Independent dependency management
- Not published to npm (private: true)

## Development

### Build Library

```bash
npm run build
```

### Run Demo

```bash
cd docs
npm install
npm run dev
```

Demo will be available at `http://localhost:3000`

### Project Structure

- `src/Timepicker/Timepicker.tsx` - Main component with forwardRef
- `src/Timepicker/types.ts` - TypeScript interfaces (extends InputHTMLAttributes)
- `src/Timepicker/utils.ts` - SSR detection helper
- `src/Timepicker/hooks/useTimepickerInstance.ts` - Dynamic import and instance creation
- `src/Timepicker/hooks/useEventHandlers.ts` - Event attachment/detachment with callback merging
- `src/Timepicker/hooks/useTimepickerValue.ts` - Controlled value synchronization
- `src/Timepicker/hooks/useTimepickerOptions.ts` - Options update handling
- `src/Timepicker/hooks/useTimepickerCallbacks.ts` - Callback re-attachment on changes

## License

MIT

## Links

- [timepicker-ui GitHub](https://github.com/pglejzer/timepicker-ui) — Core library repository
- [timepicker-ui Documentation](https://timepicker-ui.vercel.app) — Full documentation for core library
- [timepicker-ui-react Documentation](https://timepicker-ui.vercel.app/react) — React wrapper documentation
- [timepicker-ui-react GitHub](https://github.com/pglejzer/timepicker-ui-react) — This repository
- [Report Issues](https://github.com/pglejzer/timepicker-ui-react/issues) — Bug reports and feature requests
