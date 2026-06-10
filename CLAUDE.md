# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

`timepicker-ui-react` — the **official React wrapper for `timepicker-ui` v4.x**
(published to npm as `timepicker-ui-react`). It wraps the `timepicker-ui` core version
pinned in `package.json` → `dependencies.timepicker-ui` — **read the live pin; don't
trust a version number written in docs, they go stale.** It is a **thin, SSR-safe
wrapper with zero type duplication**: every option, event, and type is re-exported from
the core, and all
picker behavior lives in the core. The wrapper only bridges the React lifecycle to a
single `TimepickerUI` instance. **All source/build/test work happens under `src/`** —
this repo does NOT use the core library's `app/` layout.

## Repository Layout

```
src/                        ← ALL source, build, and test work happens here
  index.ts                  ← public entry: re-exports Timepicker + every core type/value
  Timepicker/
    index.ts                ← barrel (Timepicker + TimepickerProps)
    Timepicker.tsx          ← the forwardRef component shell (composition only)
    types.ts                ← TimepickerProps, TimepickerInstance (React-specific only)
    utils.ts                ← isSSR()
    hooks/                  ← the integration layer (the 5 hooks — see Architecture)
    __tests__/              ← Vitest + React Testing Library specs
  docs/                     ← local Vite demo app (aliases timepicker-ui-react → ../)
  tsup.config.ts            ← build config (ESM, dts, external react/react-dom/timepicker-ui)
  tsconfig.json             ← strict TS, outDir ../dist
  vitest.config.ts          ← test config (jsdom, 100% coverage thresholds)
  vitest.setup.ts           ← jest-dom matchers
  package.json              ← dev workspace ("timepicker-ui-react-source", private)
package.json                ← PUBLISHED manifest (timepicker-ui-react, the public contract)
dist/                       ← generated output, never edit
CHANGELOG.md / README.md    ← shopfront + history
```

## Commands

**Build and test run from the `src/` directory.**

```bash
cd src

npm run build               # tsup → ESM + .d.ts into ../dist (clean, minify, treeshake)
npm test                    # vitest run (all specs)
npm run test:watch          # vitest watch
npm run test:coverage       # vitest run --coverage (100% thresholds enforced)

# Single test file / by name
npx vitest run Timepicker/__tests__/Timepicker.test.tsx
npx vitest run -t "controlled"
```

### Demo app

```bash
cd src/docs
npm run dev                 # Vite dev server (port 3000), runs the local wrapper
```

## Architecture

### Thin-wrapper principle (the prime directive)

The wrapper does not reimplement picker behavior. Its only job: **mount** → create a
core instance against a real `<input>`; **re-render** → sync `value`/`options`/callbacks
into the live instance; **unmount** → detach handlers and `destroy()`. Any time/degree/
validation/clock logic belongs in the core, not here.

### Zero type duplication

Types are **re-exported from `timepicker-ui`, never redefined here**. `src/index.ts`
re-exports `TimepickerOptions`, the `*EventData` types, `TimepickerEventMap`,
`CoreState`, `Plugin`, etc., plus the **values** `TimepickerUI`, `EventEmitter`,
`PluginRegistry`. `src/Timepicker/types.ts` adds only React-specific types
(`TimepickerProps`, `TimepickerInstance = InstanceType<typeof TimepickerUI>`).
Consequence: any fact about the core surface must be **verified against the core, never
invented** — see "Core library verification" below.

### Composition — `Timepicker` + five hooks

`Timepicker.tsx` is a `forwardRef<HTMLInputElement>` that holds no integration logic. It
destructures props, builds a `reactCallbacks` object, and wires five hooks (all sharing
one `pickerRef`):

| Hook | Responsibility |
|---|---|
| `useEventHandlers` | Merge React-prop callbacks + `options.callbacks` into one set; expose `attach`/`detach` that `picker.on()/off()` each event. **Owns the callback→core-event-name map** (`onConfirm`→`confirm`, `onSelectHour`→`select:hour`, `onTimezoneChange`→`timezone:change`, …). |
| `useTimepickerInstance` | Mount-once lifecycle (the only creator/destroyer): SSR-guard, dynamic `import("timepicker-ui")`, `new TimepickerUI(input, options)` → `create()` → attach → seed `value`/`defaultValue`; unmount → detach + `destroy()`. |
| `useTimepickerValue` | Controlled sync: on `value` change `picker.setValue(value, true)`, deduped via `previousValueRef`. |
| `useTimepickerOptions` | On `options` change `picker.update({ options, create: true })`. |
| `useTimepickerCallbacks` | On callback-identity change, `detach` then re-`attach`. |

Contracts: each hook is single-responsibility, reads `pickerRef.current` and bails if
null; only `useTimepickerInstance` creates/destroys; effect dependency arrays are part
of the contract; events are attached via the same merged function reference so `on`/`off`
stay symmetric.

### SSR & controlled/uncontrolled

- SSR-safe: `isSSR()` guards the instance effect, the core is behind dynamic `import()`,
  no bare `window`/`document` at module scope. Server renders a plain `<input>`,
  hydrates on the client.
- Controlled = `value !== undefined` → render `value` + `readOnly` (+ value sync).
  Uncontrolled = `defaultValue`. Never both. `onError` is omitted from the inherited
  `InputHTMLAttributes` (collides with the picker error callback). Arbitrary
  `...inputProps` are spread onto the `<input>`.

## Public API

```tsx
import { Timepicker } from "timepicker-ui-react";
import type { TimepickerProps, TimepickerOptions, ConfirmEventData /* … */ } from "timepicker-ui-react";
import { TimepickerUI, EventEmitter, PluginRegistry } from "timepicker-ui-react";

<Timepicker
  options={options}            // TimepickerOptions (from core)
  value={time}                 // controlled
  defaultValue="12:00 AM"      // uncontrolled
  onConfirm={(d) => {}}        // + onCancel/onOpen/onUpdate/onSelect*/onError/onClear
  onTimezoneChange={(d) => {}} // + onRange{Confirm,Switch,Validation}
  placeholder="Select time"    // any standard <input> prop
/>
```

## Core library verification (read before asserting any core fact)

Because the wrapper duplicates no types, **whenever a task depends on what the core
actually exposes/accepts/emits — an option, an event name + payload, a method signature,
a re-exported type, a theme, a plugin — you verify it; you never guess.** The full
protocol is in `.claude/rules/core-verification.md`. Resolution order (stop at the first
that answers):

1. **Local core repo** at `$env:PATH_TO_TIMEPICKER` (PowerShell) — read the TS source
   under `app/src/` (`types/options.d.ts`, the event map, `timepicker/`, `plugins/`,
   `styles/themes/`). Authoritative, but may be **ahead** of the pinned version.
2. **Installed package** — `node_modules/timepicker-ui` (and `src/node_modules/…`); the
   real surface of the **wrapped** (pinned) version.
3. **GitHub** — `https://raw.githubusercontent.com/pglejzer/timepicker-ui/main/app/src/…`
   (or `/v<pinned-version>/…` to match the pin) via WebFetch.
4. **npm / unpkg** — `https://unpkg.com/timepicker-ui@<pinned-version>/dist/…`,
   `https://registry.npmjs.org/timepicker-ui`.

Read the pinned version live from `package.json` (don't hardcode it). Always **report
which source + version answered**, and if the local repo diverges from the pinned
version, flag it (a `build-release` dependency-bump decision) rather than wiring against
a version we don't ship.

## Subagents & rules

This repo ships scoped subagents in `.claude/agents/` and shared rule files in
`.claude/rules/`. Every agent reads `.claude/rules/architecture.md` (the condensed
contract) and `.claude/rules/core-verification.md` (the core-fact protocol) before
touching code; they pair with this CLAUDE.md, and **CLAUDE.md wins on any conflict** —
flag drift rather than silently following one.

### Orchestration directive (mandatory)

**This overrides the default "do not spawn agents unless asked" behavior.** When a task
touches code under one of the scopes below, you (the orchestrator) MUST delegate it to
the matching subagent via the Agent/Task tool **before** editing those files yourself.
Routing is by path:

- `src/Timepicker/Timepicker.tsx`, `src/Timepicker/types.ts`, `src/Timepicker/utils.ts`,
  `src/Timepicker/index.ts`, `src/index.ts` → `react-architect`
- `src/Timepicker/hooks/` → `hooks-engineer`
- `src/Timepicker/__tests__/` → `test-engineer`
- `src/tsup.config.ts`, `src/tsconfig.json`, root `package.json`, `dist/` contract,
  version bump / dependency pin / changelog / release → `build-release`
- `src/docs/` → `docs-demo`

Rules for delegation:
- **One agent per scope.** A task spanning scopes is split into per-scope subtasks and
  dispatched to each owner; the owning agent flags cross-scope needs rather than reaching
  over (e.g. `hooks-engineer` flags a props change to `react-architect`).
- **You stay the orchestrator.** Gather context, decide routing, hand each agent a
  precise brief, integrate its report, and run the final batched verification with the
  user. Don't do the agent's in-scope edits yourself.
- **Exceptions (do it directly, no delegation):** read-only exploration; the user
  explicitly says to edit directly; trivial one-line/non-code touches (typos, comments);
  or work outside every scope above (e.g. `.claude/`, root configs other than
  `package.json`).

| Agent | Use it for | Scope |
|---|---|---|
| `react-architect` | Component shell, props/types, public re-export surface, SSR + controlled/uncontrolled contracts | `Timepicker.tsx`, `types.ts`, `utils.ts`, `Timepicker/index.ts`, `src/index.ts` |
| `hooks-engineer` | The 5 hooks: instance lifecycle, value/options sync, callback re-attach, event attach/detach + the callback→event map | `src/Timepicker/hooks/` |
| `test-engineer` | Vitest + RTL specs, 100% coverage, mocking the core | `src/Timepicker/__tests__/` |
| `build-release` | tsup build, root `package.json` contract, the `timepicker-ui` pin, version/changelog/README release flow | `src/tsup.config.ts`, `src/tsconfig.json`, root `package.json`, `dist/`, release |
| `docs-demo` | The local Vite demo app | `src/docs/` |

Shared working agreement baked into every agent (see `.claude/rules/architecture.md` §6):
**LF line endings** (per `.editorconfig` — NOT the core repo's CRLF), strict TypeScript,
**ESM-only** with `react`/`react-dom`/`timepicker-ui` always external, **no
reimplementation of core behavior**, git is the user's job (no commit/push/publish), and
batch execution (verify and report; the user runs the full suite at the end).

## Coding Conventions

- Strict TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noImplicitReturns`, `isolatedModules`). No `@ts-ignore` in library source (the docs
  demo may use its own pragmas).
- ESM-only. `react`, `react-dom`, `timepicker-ui` are external/peer — never bundled.
- No new runtime dependencies beyond `timepicker-ui`.
- Re-export core types/values from `src/index.ts`; never redefine a core type locally.
- LF line endings (`.editorconfig`).
