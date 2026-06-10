# architecture.md — timepicker-ui-react shared rules

The single source of truth every subagent reads before touching code. Pairs with the
root `CLAUDE.md` (full repo map + commands) and `.claude/rules/core-verification.md`
(how to confirm anything about the wrapped `timepicker-ui` core). When this file and
`CLAUDE.md` disagree, `CLAUDE.md` wins — flag the drift instead of silently following one.

`timepicker-ui-react` is the **official React wrapper for `timepicker-ui` v4.x**
(published to npm as `timepicker-ui-react`; it wraps the `timepicker-ui` core version
pinned in `package.json` → `dependencies` — read the live pin, don't trust a number
written here). It is a **thin, SSR-safe wrapper with zero type duplication** —
every option, event, and type is re-exported from the core; all behavior comes from the
core. **All source/build/test work happens under `src/`** (this repo does NOT use the
core's `app/` layout).

## 1. Thin-wrapper principle (the prime directive)

The wrapper does **not** reimplement time-picker behavior. Its entire job is to bridge
the React lifecycle to a single `TimepickerUI` core instance:

- Mount → create the core instance against a real `<input>`.
- Re-render → sync `value` / `options` / callbacks into the live instance.
- Unmount → detach handlers and `destroy()` the instance.

If you ever feel the need to compute degrees, parse times, validate, render the clock,
or otherwise *do* picker logic in this repo — stop. That belongs in the core. Add it
there (or flag it), then expose/forward it. The only logic that lives here is
React-glue logic.

## 2. Zero type duplication

Types are **re-exported from `timepicker-ui`, never redefined here**. `src/index.ts`
re-exports `TimepickerOptions`, the event-data types, `CoreState`, `Plugin`, etc.
directly from the core. `src/Timepicker/types.ts` only adds the React-specific surface
(`TimepickerProps`, `TimepickerInstance = InstanceType<typeof TimepickerUI>`).

Consequence: **whenever you need to know what an option/event/type actually is, you
verify it against the core — you never invent it.** That verification has a strict
order (local repo → installed package → GitHub → npm). See
`.claude/rules/core-verification.md`. This is the most important operational rule in the
repo.

## 3. Composition — `Timepicker` + five hooks

`src/Timepicker/Timepicker.tsx` is a `forwardRef<HTMLInputElement>` component. It holds
no integration logic itself — it wires props into five single-responsibility hooks
(`src/Timepicker/hooks/`), all sharing one `pickerRef` (`useRef<TimepickerInstance>`):

| Hook | Responsibility |
|---|---|
| `useEventHandlers` | Merge React-prop callbacks + `options.callbacks` into one set; expose `attach`/`detach` that `picker.on()/off()` each core event. Owns the **callback-name → core-event-name** map (`onConfirm`→`confirm`, `onSelectHour`→`select:hour`, `onTimezoneChange`→`timezone:change`, …). |
| `useTimepickerInstance` | Mount-once lifecycle: SSR-guard, dynamic `import("timepicker-ui")`, `new TimepickerUI(input, options)` → `create()` → attach handlers → seed `value`/`defaultValue`; on unmount detach + `destroy()`. Returns `pickerRef`. |
| `useTimepickerValue` | Controlled-mode sync: when `value` changes, `picker.setValue(value, true)` (deduped via `previousValueRef`). |
| `useTimepickerOptions` | When `options` change, `picker.update({ options, create: true })`. |
| `useTimepickerCallbacks` | When any callback identity changes, `detach` then re-`attach` on the live instance. |

**Hook contract rules:**
- Each hook does exactly one thing and reads the live instance via `pickerRef.current`,
  bailing if it's null (instance not mounted / SSR).
- `useTimepickerInstance` mounts **once** (empty deps) and is the only place that
  creates/destroys the instance. Other hooks never create or destroy — they sync.
- Effect dependency arrays are part of the contract. Adding a synced prop means adding
  it to the right hook's deps; getting deps wrong = stale closures or re-create storms.
- Event handlers are always attached through `useEventHandlers`' merged set so the
  exact same function reference is used for `on` and `off` — never bind ad-hoc.

## 4. Public API / exports (`src/index.ts`)

Stable, treat as a contract:
- `Timepicker` (component) and `TimepickerProps` (type).
- The full re-exported type surface from `timepicker-ui` (options groups, all
  `*EventData`, `TimepickerEventMap`, `CoreState`, plugin types, …).
- Re-exported **values** `TimepickerUI`, `EventEmitter`, `PluginRegistry` from the core
  (so consumers register plugins without a second install).

Don't change `TimepickerProps`' shape, the controlled/uncontrolled semantics, or drop a
re-export without flagging it as a breaking change (it ships in `.d.ts`).

## 5. SSR & controlled/uncontrolled contracts

- **SSR-safe.** `isSSR()` (`src/Timepicker/utils.ts`) guards the instance effect; the
  core is loaded via dynamic `import()` so it never runs at module top level. On the
  server the component renders a plain `<input>`; the picker hydrates on the client. No
  bare `window`/`document` at module scope.
- **Controlled** = `value !== undefined` → render `value` + `readOnly`, and
  `useTimepickerValue` pushes changes into the core. **Uncontrolled** = `defaultValue`.
  Never render both. `onError` is intentionally `Omit`ted from the inherited
  `InputHTMLAttributes` (it collides with the picker's error callback).
- The component spreads arbitrary `...inputProps` onto the `<input>` — keep that
  passthrough; don't intercept standard input props.

## 6. Working agreement (applies to every agent)

- **Line endings: LF.** Per `.editorconfig` this repo uses `lf` — do NOT apply the core
  repo's CRLF convention here. Match existing file style.
- **Strict TypeScript.** `tsconfig` is `strict` with `noUnusedLocals`,
  `noUnusedParameters`, `noImplicitReturns`, `isolatedModules`. No `@ts-ignore` in
  library source (the docs demo is allowed its own pragmas).
- **ESM-only, React 17+.** Output is ESM (`tsup`, `format: ["esm"]`). `react`,
  `react-dom`, `timepicker-ui` are `external` / peer-or-dep — never bundle them. No new
  runtime dependencies; the wrapper stays dependency-light (only `timepicker-ui`).
- **No reimplementation.** See §1. Forward to the core; don't rebuild it.
- **Git is the user's job.** Never `git add` / `commit` / `push` / `branch` / `merge` /
  `npm publish`. Read-only git (`status`, `log`, `diff`) is fine.
- **Batch execution.** Don't run `build` / `test` after each task. Verify by reading and
  reasoning; report what changed; let the user run the full suite at the end. (A single
  focused `vitest` run while iterating on one spec is fine — that's debugging.)
- Stay in your declared scope (see each agent's `description`). If a change must cross
  into another agent's territory, say so rather than reaching over.
