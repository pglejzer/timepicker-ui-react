---
paths:
  - "src/tsup.config.ts"
  - "src/tsconfig.json"
  - "package.json"
  - "CHANGELOG.md"
  - "README.md"
---

# Build & release rules

Applies to the build pipeline, the published manifest, and version/changelog work.
Pairs with `.claude/rules/architecture.md` and `.claude/rules/core-verification.md`.

## Build

- **tsup, ESM-only.** `src/tsup.config.ts`: single entry `Timepicker/index.ts`,
  `format: ["esm"]`, `dts: true`, `treeshake`, `minify`, `clean`, `outDir: ../dist`,
  and `external: ["react", "react-dom", "timepicker-ui"]` — those three are NEVER
  bundled. `esbuildOptions` drops `console`/`debugger`. Build runs from `src/`
  (`cd src && npm run build`).
- **`dist/` is generated, never hand-edited.** You change configs, not artifacts.
- **The root `package.json` is the public contract.** `version`, `exports`, `main`,
  `types`, `type: "module"`, `sideEffects: false`, `files: ["dist"]`,
  `peerDependencies` (`react`/`react-dom` `>=17`), and `dependencies.timepicker-ui`.
  Changing any of these affects consumers — call it out. Keep it ESM-only and
  `sideEffects: false` so the wrapper tree-shakes.

## The `timepicker-ui` dependency (special to this repo)

The wrapper pins a core version in `dependencies.timepicker-ui` (read the live value —
don't assume a number). This pin is load-bearing — it's the surface the re-exports, the
callback→event map, and `TimepickerProps` are validated against (see
`.claude/rules/core-verification.md`).

- **Bumping the core dep is an API-surface event for the wrapper.** A new core version
  may add options/events/types the wrapper should re-export or map. After a bump,
  re-run core verification on anything the wrapper mirrors and flag gaps to
  `react-architect` / `hooks-engineer`.
- Keep the pinned version, the version referenced in `README.md`, and (if present) the
  docs demo's expectations consistent. Confirm the new version actually exists on npm
  (`https://registry.npmjs.org/timepicker-ui`) before pinning it.

## Release & versioning

- **Source of truth = root `package.json` `version`** (the published
  `timepicker-ui-react`). `src/package.json`
  (`timepicker-ui-react-source`, `private`) is the dev workspace — its `version` is
  decoupled; do NOT bump it to the public number unless the user asks. Flag the
  discrepancy rather than "fixing" it.
- **Pick the bump by SemVer**, driven by actual changes: `patch` = fixes/internal;
  `minor` = new backwards-compatible props/re-exports/features; `major` = any breaking
  change to `TimepickerProps`, controlled/uncontrolled semantics, or the export list.
  A major needs migration notes. If unsure of magnitude, ask — the number is a promise.
- **Bump current-version references only; never rewrite history.** Bump the root
  `version` and any "current/latest" mention (README install/version lines). Leave prior
  `CHANGELOG.md` entries and "since vX" / "removed in vX" phrasing untouched.
- **CHANGELOG.md** follows Keep a Changelog + SemVer: new release at the top
  `## [x.y.z] - YYYY-MM-DD` (real date) with only the applicable
  Added/Changed/Fixed/Deprecated/Removed/Security groups. Entries are user-facing and
  truthful — what changed for a consumer of the React wrapper, not raw commits. A core
  dependency bump that changes the wrapper's surface belongs in the changelog.
- **README.md is the npm/GitHub shopfront.** On release, update only what changed
  (version mentions, API/Options/Plugins/Themes snippets if the surface moved); verify
  code snippets still use real props and the v4 option groups (core-verify if unsure).

## Always finish by

- Reporting config/version/changelog changes and their consumer impact (exports, bundle
  shape, peer/dep ranges, the new version). You MAY run `cd src && npm run build` to
  confirm it builds and types emit — report real output, never claim green unrun.
- Leaving execution to the user: **never** `git add/commit/tag/push` or `npm publish`.
  Propose the version, tag (`v<new-version>`), and a commit message; let the user run them.
- LF line endings (per `.editorconfig`); no new runtime deps beyond `timepicker-ui`.
