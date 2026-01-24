# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2026-01-24

### Updated

- **timepicker-ui** — Updated dependency from `4.0.2` to `4.0.3`

---

## [1.0.0] - 2024-11-23

### Added

#### Core Features

- **Full TypeScript Support** — All types directly from timepicker-ui core
- **SSR-Safe Architecture** — Works with Next.js, Remix, Gatsby, and other SSR frameworks
- **Zero Type Duplication** — Re-exports core types, no duplicated interfaces
- **Event-Driven API** — Direct mapping to timepicker-ui's EventEmitter API
- **Controlled & Uncontrolled** — Support for both value patterns
- **ForwardRef Support** — Compatible with React Hook Form and other form libraries
- **ESM Only** — Modern, tree-shakeable bundle

#### Component API

- `Timepicker` component with forwardRef
- Props extend `InputHTMLAttributes<HTMLInputElement>` for full input prop support
- Direct prop passing (no inputProps wrapper)
- All timepicker-ui callbacks as React props: `onConfirm`, `onCancel`, `onOpen`, `onUpdate`, `onSelectHour`, `onSelectMinute`, `onSelectAM`, `onSelectPM`, `onError`
- `options` prop for grouped configuration (clock, ui, labels, behavior)
- `value` and `defaultValue` for controlled/uncontrolled modes

#### Custom Hooks

- `useTimepickerInstance` — SSR-safe dynamic import and instance creation
- `useEventHandlers` — Event attachment/detachment with callback merging
- `useTimepickerValue` — Controlled value synchronization with debouncing
- `useTimepickerOptions` — Options update handling via picker.update()
- `useTimepickerCallbacks` — Callback re-attachment on changes

#### Architecture

- **Composition-based** — Clean wrapper using custom hooks, no inheritance
- **Modular design** — Separated concerns with dedicated hooks
- **SSR-safe** — Dynamic imports with browser-only checks (typeof window)
- **Type-safe** — Strict TypeScript with no `any` types

#### Package Structure

- Dual-package setup: root for npm metadata, src/ for development
- Separate build configuration (tsup) and demo environment (Vite)
- Production bundle in `dist/` (ESM + TypeScript definitions)

### Dependencies

- `timepicker-ui` ^4.0.2 — Core library with Firefox fixes and onUpdate events
- `react` >=17 — Peer dependency
- `react-dom` >=17 — Peer dependency

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
