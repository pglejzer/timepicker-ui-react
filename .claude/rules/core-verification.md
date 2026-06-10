# core-verification.md — how to confirm anything about the `timepicker-ui` core

**Read this before asserting any fact about the wrapped library.** Every agent in this
repo reads it. This wrapper has **zero type duplication** (see `architecture.md` §2): it
does not own the definition of any option, event, type, method, theme, or plugin — the
core `timepicker-ui` package does. So whenever a task depends on "what does the core
actually expose / accept / emit?", you must **verify against the core, never guess**.

> **Don't trust version numbers written in docs or rules — they go stale fast.** The
> live truth is the pin in the root `package.json` → `dependencies.timepicker-ui`. Read
> it at runtime (`node -e "console.log(require('./package.json').dependencies['timepicker-ui'])"`
> from the repo root, or `require('timepicker-ui/package.json').version` for what's
> installed) and use *that* version in any pinned URL below. Version numbers in the
> examples here are placeholders — substitute the live pin.

## When this protocol applies

Trigger it whenever you need ground truth about the core, e.g.:
- An option exists / its group / its shape (`clock.*`, `ui.*`, `labels.*`,
  `behavior.*`, `wheel.*`, `range.*`, `timezone.*`, `clearBehavior.*`).
- An event name and its payload (`confirm`, `select:hour`, `timezone:change`, …) —
  needed for the callback→event map in `useEventHandlers`.
- A public method / signature (`create`, `open`, `close`, `setValue`, `update`,
  `getValue`, `on/once/off`, statics) or the `getValue()` shape.
- An exported type or value (`TimepickerOptions`, `*EventData`, `TimepickerEventMap`,
  `CoreState`, `Plugin`, `PluginRegistry`, `EventEmitter`, …) that `src/index.ts`
  re-exports.
- A theme name, a plugin's options/registration, or version-specific behavior.

If you're editing `src/index.ts`' re-export list, the callback map in
`useEventHandlers`, `TimepickerProps`, or anything that mirrors the core surface — this
protocol is mandatory.

## Resolution order (stop at the first that answers)

### 1. Local core repo via `PATH_TO_TIMEPICKER` (authoritative source)

The user keeps the core repo locally and exposes its path in the **`PATH_TO_TIMEPICKER`
env var** (this is the only thing that variable holds — reading it is safe and expected).

Read it (PowerShell on this machine):

```powershell
$env:PATH_TO_TIMEPICKER          # e.g. C:\Users\glejz\Desktop\projekty\timepicker-ui
```

If set and the path exists, treat it as the core repo root and read the **TypeScript
source** under `app/src/` — it's the richest, most current truth:

| You want… | Read in the local core repo |
|---|---|
| Option groups & shapes | `app/src/types/options.d.ts` |
| Event map / event-data types | `app/src/types/types.d.ts`, `app/src/types/ITimepickerUI.d.ts` (and the `TimepickerEventMap`) |
| Public API / method signatures | `app/src/timepicker/` (TimepickerUI / CoreState / Managers / Lifecycle) |
| Plugin contracts & built-ins | `app/src/core/PluginRegistry.ts`, `app/src/plugins/` |
| Theme names | `app/src/styles/themes/` |
| Published surface & version | `package.json` (root) of the core repo |

> **Version caveat:** the local repo may be **ahead** of the version this wrapper
> depends on (the wrapper pins a core version in `package.json`; the local checkout can
> be a newer release). The local source is the best *explanation*, but for "is this in
> the version we ship against?" confirm against the installed/pinned version too (step 2)
> and **flag any divergence**.

### 2. Installed package (what we actually wrap)

The pinned, published artifact is in `node_modules` — this is exactly what consumers get
with the current `dependencies` entry. Check it for the **wrapped version's** real
surface:

```powershell
node -e "console.log(require('timepicker-ui/package.json').version)"
```

- `node_modules/timepicker-ui/` (root install) and `src/node_modules/timepicker-ui/`
  (dev workspace install) — read the shipped `dist/*.d.ts` and `package.json` `exports`.
- Best source for "does the version we depend on expose X?" Use it to confirm step-1
  findings against the pinned version, especially before editing re-exports or the
  event map.

### 3. GitHub (fallback when no local repo / file not found there)

If `PATH_TO_TIMEPICKER` is unset, the path is missing, or the specific file isn't there,
fetch from the core's GitHub repo with WebFetch:

- Repo: `https://github.com/pglejzer/timepicker-ui`
- Raw source (latest): `https://raw.githubusercontent.com/pglejzer/timepicker-ui/main/app/src/<path>`
  - e.g. `…/main/app/src/types/options.d.ts`
- **Version-pinned** (matches what we ship against — prefer this when checking the
  wrapped version): `https://raw.githubusercontent.com/pglejzer/timepicker-ui/v<pinned-version>/app/src/<path>`,
  where `<pinned-version>` is the live pin you read from `package.json` (e.g.
  `v4.3.0`). Fall back to `main` if the tag path 404s.

### 4. npm / unpkg (final fallback)

If GitHub is unavailable, read the published package, **version-pinned** to the live pin
you read from `package.json` (shown below as `@<pinned-version>`, e.g. `@4.3.0`):

- Type defs / exports: `https://unpkg.com/timepicker-ui@<pinned-version>/dist/` (browse)
  or a specific file, e.g. `https://unpkg.com/timepicker-ui@<pinned-version>/dist/index.d.ts`.
- Manifest: `https://unpkg.com/timepicker-ui@<pinned-version>/package.json`.
- Registry metadata / all versions: `https://registry.npmjs.org/timepicker-ui` or the
  page `https://www.npmjs.com/package/timepicker-ui`.

## Reporting rule

Whenever a change rests on a core fact, **state which source answered and the version**
(read the version, don't recite one from memory), e.g. "confirmed `wheel.commitOnScroll`
exists — `$env:PATH_TO_TIMEPICKER`/app/src/types/options.d.ts (local source); also present
in the installed `node_modules/timepicker-ui` (the pinned version)." If the local source
and the pinned version disagree (an option/event exists locally but not in the version we
depend on), **do not wire it up silently** — surface the mismatch and let the user decide
whether to bump the `timepicker-ui` dependency (a `build-release` concern).
