# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.6.0] - 2026-10-19

### Updated

- timepicker-ui dependency from 4.5.0 to 4.6.0

### Added

- `ui.inline.embedded`, `range.linked` and `clock.isTimeDisabled` options (from core). Keep the `isTimeDisabled` function stable, or the picker re-renders on every render
- `setRange()`, `getRange()`, `setActivePart()` and `refreshDisabledTime()` on the core instance, reachable with `TimepickerUI.getById(id)` (from core)
- Re-exported `TimeOfDay`, `RangeTimeValue` and `RangeTimeState` types

### Changed

- `on()` and `once()` on the core instance return a function that removes the handler (from core)

---

## [1.5.0] - 2026-10-14

### Updated

- timepicker-ui dependency from 4.4.0 to 4.5.0

### Added

- `onShow`, `onSelectSecond`, `onSwitchView`, `onWheelScrollStart` and `onWheelScrollEnd` props. They also work in `options.callbacks`
- `onSelectPeriod` and `onSwitchFace` props for the core's new `select:period` and `switch:face` events
- Clearer option names from core 4.5.0, such as `ui.initialView` for `ui.mobile`. The old names still work until 5.0
- Re-exported `SelectSecondEventData` type, the payload of `onSelectSecond`
- Callback props now show the core's JSDoc descriptions in your editor
- Optional seconds with `clock.showSeconds: true` (from core)
- Keyboard control of the clock face (from core)

### Changed

- Callback props now also get events fired while the picker is created, such as an inline picker's `open` or an `error` during init
- The core instance no longer holds the wrapper's callbacks, so `TimepickerUI.getById(id).options.callbacks` won't list them
- Changing `options` on an open picker re-renders it and resets a selection that was not confirmed (from core)
- `behavior.returnFocus` (formerly `focusInputAfterClose`) still defaults to `false`. We recommend `true`, which becomes the default in 5.0 (from core)
- The `<input>` is now wrapped in `<div class="tp-ui">` on the server too, so markup snapshots change. A `<Timepicker>` inside a `<p>` now gets React's nesting warning

### Deprecated

- `OptionTypes` (use `TimepickerOptions`) and `HideEventData` (never emitted). Both will be removed in 5.0 (from core)

### Fixed

- Callbacks in `options.callbacks` were called twice, by the core and by the wrapper. They are now called once
- After a callback prop changed, the handler from the first render kept firing next to the new one
- A new but equal `options` object, such as inline `options={{...}}`, no longer calls `update()`, so an open picker keeps its selection
- The package now ships the documented re-exports: `TimepickerUI`, `PluginRegistry`, `EventEmitter` and the core types. Before, only `Timepicker` and `TimepickerProps` were exported
- Unmounting a `<Timepicker>` while its parent stays rendered, such as `{show && <Timepicker />}`, no longer throws `NotFoundError` and breaks the React tree
- With `range.enabled`, a range value such as `"10:00 AM - 12:00 PM"` in `value` or `defaultValue` no longer fires `onError`
- Options with an equal `Date` in `clock.currentTime.time` no longer call `update()` on every render

See the timepicker-ui 4.5.0 changelog for every core change.

---

## [1.4.0] - 2026-06-10

### Updated

- timepicker-ui dependency from 4.3.0 to 4.4.0

### Added

- Two new built-in themes, `blueprint` and `blueprint-dark`, selectable via `options.ui.theme` (theme count is now 12). Each ships as its own tree-shakeable stylesheet: `import "timepicker-ui/theme-blueprint.css"` / `import "timepicker-ui/theme-blueprint-dark.css"`
- 16 new accessibility labels configurable through `options.labels`: `hourLabel`, `minuteLabel`, `clockLabel`, `periodLabel`, `timeLabel`, `format24Label`, `rangeSelectionLabel`, `switchToKeyboardLabel`, `switchToClockLabel`, `toggleLabel`, `timezoneSelectorLabel`, `announceHour`, `announceMinute`, `announceAmSelected`, `announcePmSelected`, `invalidTimeFormat` (flow through the already re-exported `LabelsOptions` / `TimepickerOptions`)
- Home / End / PageUp / PageDown keyboard support on the clock spinbuttons and wheel columns (from core)

### Changed

- ARIA / screen-reader text now reads from the `labels` group; clock spinbuttons expose `aria-valuetext`; the focus trap now skips `aria-disabled` / `aria-hidden` elements (from core)

### Fixed

- High-contrast focus halo rendering (from core)
- Firefox native spinner buttons removed on clock inputs (from core)
- Body scroll-lock is now reference-counted, fixing a stuck unscrollable page when multiple pickers open/close (from core)
- `theme-crane-straight.css` is now present in the core package `exports` map (from core)

### Notes

- No wrapper API changes were required: all new core surface (themes, labels, keyboard handling) flows through the already re-exported `TimepickerOptions` / `LabelsOptions` / `UIOptions`. No new re-exports, no new event-map entries, no `TimepickerProps` changes.

---

## [1.3.0] - 2026-03-29

### Updated

- timepicker-ui dependency from 4.2.1 to 4.3.0

### Added

- Re-exported `TemplateProvider` type - interface for plugin `templateProvider` hook
- Re-exported `ClearHandler` type - interface for plugin `clearHandler` hook

### Notes

- Plugins now support a `templateProvider` hook to register their own modal templates without core static imports
- Plugins now support a `clearHandler` hook to register custom clear logic executed when the clear button is pressed
- Plugin system refactored for true tree-shaking: unused plugins (wheel, range, timezone) are completely excluded from the final bundle when not imported
- `PluginRegistry.getTemplateProvider()` and `PluginRegistry.getClearHandler()` methods now available on the re-exported `PluginRegistry`

---

## [1.2.0] - 2026-03-24

### Added

- `onClear` prop - callback triggered when the clear button is clicked (maps to `CallbacksOptions["onClear"]` / `clear` event)
- Re-exported `ClearEventData` type - payload for the `onClear` callback
- Re-exported `ClearBehaviorOptions` type - options for `clearBehavior.clearInput` configuration
- Re-exported `WheelOptions` type - options for `wheel` configuration (placement, hideDisabled, commitOnScroll, ignoreOutsideClick, hideFooter)
- Re-exported `WheelScrollStartEventData` type - payload for the `wheel:scroll:start` event
- Re-exported `WheelScrollEndEventData` type - payload for the `wheel:scroll:end` event
- Re-exported `WheelOptions` type - now available for wheel/compact-wheel mode configuration

### Updated

- timepicker-ui dependency from 4.1.7 to 4.2.1

---

## [1.1.2] - 2026-03-08

### Updated

- timepicker-ui dependency from 4.1.6 to 4.1.7

---

## [1.1.1] - 2026-02-14

### Updated

- timepicker-ui dependency from 4.1.2 to 4.1.6

### Added

- Re-exported Range plugin types: RangeOptions, RangeConfirmEventData, RangeSwitchEventData, RangeValidationEventData

---

## [1.1.0] - 2026-02-08

### Added

- Timezone callback support via onTimezoneChange prop
- Range mode callback support via onRangeConfirm, onRangeSwitch, onRangeValidation props
- Comprehensive test suite with Vitest achieving 100% code coverage across all modules
- Plugin registration guide in README with Timezone and Range examples
- Re-exported TimezoneChangeEventData and TimepickerEventMap types from timepicker-ui

### Updated

- timepicker-ui dependency from 4.0.3 to 4.1.2

---

## [1.0.1] - 2026-01-24

### Updated

- **timepicker-ui** - Updated dependency from `4.0.2` to `4.0.3`

---

## [1.0.0] - 2024-11-23

### Added

#### Core Features

- **Full TypeScript Support** - All types directly from timepicker-ui core
- **SSR-Safe Architecture** - Works with Next.js, Remix, Gatsby, and other SSR frameworks
- **Zero Type Duplication** - Re-exports core types, no duplicated interfaces
- **Event-Driven API** - Direct mapping to timepicker-ui's EventEmitter API
- **Controlled & Uncontrolled** - Support for both value patterns
- **ForwardRef Support** - Compatible with React Hook Form and other form libraries
- **ESM Only** - Modern, tree-shakeable bundle

#### Component API

- `Timepicker` component with forwardRef
- Props extend `InputHTMLAttributes<HTMLInputElement>` for full input prop support
- Direct prop passing (no inputProps wrapper)
- All timepicker-ui callbacks as React props: `onConfirm`, `onCancel`, `onOpen`, `onUpdate`, `onSelectHour`, `onSelectMinute`, `onSelectAM`, `onSelectPM`, `onError`
- `options` prop for grouped configuration (clock, ui, labels, behavior)
- `value` and `defaultValue` for controlled/uncontrolled modes

#### Custom Hooks

- `useTimepickerInstance` - SSR-safe dynamic import and instance creation
- `useEventHandlers` - Event attachment/detachment with callback merging
- `useTimepickerValue` - Controlled value synchronization with debouncing
- `useTimepickerOptions` - Options update handling via picker.update()
- `useTimepickerCallbacks` - Callback re-attachment on changes

#### Architecture

- **Composition-based** - Clean wrapper using custom hooks, no inheritance
- **Modular design** - Separated concerns with dedicated hooks
- **SSR-safe** - Dynamic imports with browser-only checks (typeof window)
- **Type-safe** - Strict TypeScript with no `any` types

#### Package Structure

- Dual-package setup: root for npm metadata, src/ for development
- Separate build configuration (tsup) and demo environment (Vite)
- Production bundle in `dist/` (ESM + TypeScript definitions)

### Dependencies

- `timepicker-ui` ^4.0.2 - Core library with Firefox fixes and onUpdate events
- `react` >=17 - Peer dependency
- `react-dom` >=17 - Peer dependency

---

## Notes

### Versioning Strategy

This package follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version when making incompatible API changes
- **MINOR** version when adding functionality in a backward compatible manner
- **PATCH** version when making backward compatible bug fixes

### Breaking Changes Policy

Breaking changes will be clearly marked in the changelog with migration guides.

### Dependency Updates

- Core library updates (`timepicker-ui`) will be tracked in MINOR versions
- React version requirements will only change in MAJOR versions
