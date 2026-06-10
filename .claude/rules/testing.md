---
paths:
  - "src/Timepicker/__tests__/**/*.{ts,tsx}"
---

# Testing rules

Applies when working in `src/Timepicker/__tests__/`. Pairs with
`.claude/rules/architecture.md` and `.claude/rules/core-verification.md`.

- **Vitest + @testing-library/react on jsdom.** Globals enabled, setup in
  `src/vitest.setup.ts` (jest-dom matchers). Tests live in
  `src/Timepicker/__tests__/` as `*.test.{ts,tsx}` and run from `src/` (`npm test` →
  `vitest run`).
- **Coverage is enforced at 100%** (statements/branches/functions/lines) over
  `Timepicker/**/*.{ts,tsx}`, **excluding** `__tests__/**`, every `index.ts`, and
  `hooks/useTimepickerInstance.ts` (the dynamic-import lifecycle hook — hard to cover
  deterministically). Keep new code covered, and don't add files to the exclude list to
  dodge coverage — justify any change to it.
- **Mock the core, don't run it.** The wrapper's job is glue (see architecture §1), so
  tests assert the glue: that the right core method fires with the right args
  (`create`, `setValue`, `update`, `destroy`, `on`/`off`) and that the
  callback→event-name mapping is correct. Mock `timepicker-ui` (`vi.mock`) with a fake
  `TimepickerUI` exposing spies; assert on those spies. Don't assert real clock math —
  that's the core's own suite.
- **Test the contracts that matter:** controlled (`value` + `readOnly`) vs uncontrolled
  (`defaultValue`); SSR path (`isSSR` true → plain input, no instance); mount→create→
  attach and unmount→detach→destroy ordering; value/options re-sync on prop change;
  callback re-attach on callback identity change; `forwardRef` exposes the input.
- **Event names are a core fact.** When a spec pins `onSelectHour`→`select:hour` etc.,
  the mapping it asserts must match the core — verify via
  `.claude/rules/core-verification.md` before encoding a new mapping in a test.
- **Never weaken an assertion to make red go green.** If behavior legitimately changed,
  assert the new correct call/arg that proves the same contract; if the source isn't
  testable cleanly (hidden side effects), flag it for the owning agent
  (`react-architect` / `hooks-engineer`) instead of contorting the test.
- Don't run the full suite per task while iterating — run a focused spec; the user runs
  the full `npm test` / coverage at the end. No git.
