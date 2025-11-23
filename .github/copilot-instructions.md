---
applyTo: "src/**/*.ts, src/**/*.tsx"
---

# Copilot Architecture & Code Rules for timepicker-ui-react

Copilot MUST ALWAYS generate code using the following architecture, rules, and constraints.
These rules are absolute and have the highest priority.

---

# 1. Architecture — React Wrapper for timepicker-ui

## Mandatory Rules:

- **Thin Wrapper Only** — This is a lightweight React wrapper around timepicker-ui core
- **Zero Type Duplication** — ALL types MUST come from timepicker-ui core via re-exports
- **No Local Interfaces** — Never create local copies of timepicker-ui types
- **Composition with Hooks** — Use custom hooks for separation of concerns
- **SSR-Safe** — All code must work in Node.js/SSR environments
- **Event Bridge Pattern** — React callbacks bridge to EventEmitter API

## Required Structure (ONLY these are allowed):

```
src/
├── Timepicker/
│   ├── Timepicker.tsx          # Main component (forwardRef)
│   ├── types.ts                # React-specific types (extends InputHTMLAttributes)
│   ├── utils.ts                # SSR helpers
│   └── hooks/
│       ├── useTimepickerInstance.ts    # Dynamic import + instance creation
│       ├── useEventHandlers.ts         # Event attachment with callback merging
│       ├── useTimepickerValue.ts       # Controlled value sync
│       ├── useTimepickerOptions.ts     # Options update handling
│       └── useTimepickerCallbacks.ts   # Callback re-attachment
└── index.ts                    # Re-exports
```

---

# 2. TypeScript Rules (ABSOLUTE)

These rules are MANDATORY:

- **Never use `any`** — Zero tolerance for any types
- **Never use `unknown`** — Explicit types only
- **Never use type assertions** — No `as any`, `as unknown as`, etc.
- **Never create local type copies** — Import from timepicker-ui
- **Never disable TypeScript checks** — No @ts-ignore, @ts-nocheck
- **Always use strict, explicit typings**
- **Props must extend `React.InputHTMLAttributes<HTMLInputElement>`**
- **All imports from timepicker-ui must be type imports**: `import type { ... } from "timepicker-ui"`

### Type Import Pattern (STRICT):

```typescript
// ✅ Correct - type-only imports
import type {
  TimepickerOptions,
  ClockOptions,
  CallbacksOptions,
  ConfirmEventData,
  UpdateEventData,
} from "timepicker-ui";

// ❌ Wrong - creating local copies
interface MyConfirmData {
  hour?: string;
  minutes?: string;
}
```

---

# 3. React Best Practices (STRICT)

## Component Rules:

- **Always use `forwardRef`** — Component must support ref forwarding
- **Use `useImperativeHandle`** — Expose input ref to parent
- **Conditional rendering for controlled/uncontrolled** — `{...(isControlled ? { value } : { defaultValue })}`
- **No SSR conditional rendering** — Never conditionally render component based on `typeof window`
- **Extract event handlers** — onChange handler must be extracted and passed through

## Hook Rules:

- **One Responsibility Per Hook** — Each hook handles ONE concern
- **SSR Checks in Effects Only** — Never check `typeof window` in render
- **Dynamic Imports in Hooks** — `import("timepicker-ui")` only in useEffect
- **Proper Cleanup** — All hooks must clean up (destroy, removeEventListener, clear refs)
- **Dependency Arrays** — Explicitly list all dependencies, no omissions

### Hook Responsibilities (FIXED):

```typescript
// useTimepickerInstance
// - Dynamic import of timepicker-ui
// - Instance creation
// - Initial event handlers attachment
// - Cleanup on unmount

// useEventHandlers
// - Merge options.callbacks with React props
// - Return attachEventHandlers/detachEventHandlers
// - No direct attachment (done in useTimepickerInstance)

// useTimepickerValue
// - Sync controlled value to picker
// - Use previousValueRef to prevent loops
// - Only setValue when value actually changes

// useTimepickerOptions
// - Call picker.update() when options change

// useTimepickerCallbacks
// - Re-attach handlers when callbacks change
// - Cleanup on unmount
```

---

# 4. SSR Safety (MANDATORY)

Copilot MUST ALWAYS generate SSR-safe code.

### Forbidden:

- Accessing `window`, `document`, `HTMLElement` at module top-level
- DOM operations outside useEffect
- `typeof window` checks in component render
- Conditional component rendering based on browser detection

### Required:

```typescript
// ✅ Correct - SSR-safe
function useTimepickerInstance() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    import("timepicker-ui").then(({ TimepickerUI }) => {
      // Browser-only code here
    });
  }, []);
}

// ❌ Wrong - SSR crash
if (typeof window !== "undefined") {
  return <Timepicker />; // Hydration mismatch
}
```

---

# 5. Props Pattern (STRICT)

## TimepickerProps Interface:

```typescript
export interface TimepickerProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "ref" | "value" | "defaultValue" | "onError"
  > {
  options?: TimepickerOptions;
  value?: string;
  defaultValue?: string;
  onConfirm?: CallbacksOptions["onConfirm"];
  onCancel?: CallbacksOptions["onCancel"];
  onOpen?: CallbacksOptions["onOpen"];
  onUpdate?: CallbacksOptions["onUpdate"];
  onSelectHour?: CallbacksOptions["onSelectHour"];
  onSelectMinute?: CallbacksOptions["onSelectMinute"];
  onSelectAM?: CallbacksOptions["onSelectAM"];
  onSelectPM?: CallbacksOptions["onSelectPM"];
  // onError omitted - conflicts with input onError
}
```

### Props Usage (STRICT):

```tsx
// ✅ Correct - direct props
<Timepicker
  placeholder="Select time"
  className="my-input"
  disabled={false}
  onConfirm={(data) => console.log(data)}
/>

// ❌ Wrong - inputProps wrapper
<Timepicker inputProps={{ placeholder: "Select time" }} />
```

---

# 6. Event System (STRICT)

## Callback Merging Pattern:

```typescript
const mergeCallbacks = (
  reactCallbacks: ReactCallbacks,
  optionsCallbacks?: CallbacksOptions
): CallbacksOptions => {
  return {
    onConfirm: (data) => {
      optionsCallbacks?.onConfirm?.(data);
      reactCallbacks.onConfirm?.(data);
    },
    // ... other callbacks
  };
};
```

### Rules:

- **Options callbacks fire first** — `optionsCallbacks?.onConfirm?.(data)`
- **React props callbacks fire second** — `reactCallbacks.onConfirm?.(data)`
- **Both are optional** — Safe optional chaining
- **Use useMemo** — Prevent callback recreation on every render

---

# 7. Controlled vs Uncontrolled (STRICT)

## Pattern:

```typescript
const isControlled = value !== undefined;

return (
  <input
    ref={inputRef}
    type="text"
    {...inputProps}
    onChange={handleChange}
    {...(isControlled ? { value } : { defaultValue })}
  />
);
```

### Rules:

- **Conditional prop spreading** — Prevents React warnings
- **defaultValue for uncontrolled** — Even when syncing via setValue()
- **onChange always passed through** — Though timepicker-ui modifies DOM directly

---

# 8. Forbidden Patterns (NEVER GENERATE)

Copilot must NEVER write:

- Local type definitions duplicating timepicker-ui types
- `any` or `unknown` types
- SSR conditional rendering: `{typeof window !== "undefined" && <Component />}`
- `inputProps` wrapper pattern
- Direct DOM manipulation in React code
- Class components
- `React.FC` type (use explicit function + forwardRef)
- Untyped event handlers
- Missing cleanup in useEffect

---

# 9. File Structure Rules

### Timepicker.tsx (STRICT):

```typescript
// 1. Imports (types from timepicker-ui)
import type { TimepickerOptions, CallbacksOptions } from "timepicker-ui";

// 2. Component with forwardRef
export const Timepicker = forwardRef<HTMLInputElement, TimepickerProps>(
  (props, forwardedRef) => {
    // 3. Props destructuring
    const { options, value, defaultValue, onConfirm, ..., onChange, ...inputProps } = props;

    // 4. Refs
    const inputRef = useRef<HTMLInputElement>(null);

    // 5. Custom hooks
    useImperativeHandle(forwardedRef, () => inputRef.current!);
    const pickerRef = useTimepickerInstance(inputRef, options, /* callbacks */);
    useTimepickerValue(pickerRef, value);
    // ...

    // 6. Event handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
    };

    // 7. Render (conditional props)
    const isControlled = value !== undefined;
    return (
      <input
        ref={inputRef}
        type="text"
        {...inputProps}
        onChange={handleChange}
        {...(isControlled ? { value } : { defaultValue })}
      />
    );
  }
);

Timepicker.displayName = "Timepicker";
```

### Maximum Line Counts:

- **Timepicker.tsx**: ~80 lines
- **Each hook**: ~40 lines
- **types.ts**: ~30 lines
- **utils.ts**: ~10 lines

---

# 10. Naming Conventions

- **Components**: PascalCase (`Timepicker`)
- **Hooks**: camelCase with `use` prefix (`useTimepickerInstance`)
- **Props interfaces**: PascalCase with `Props` suffix (`TimepickerProps`)
- **Event handlers**: `handle` prefix (`handleChange`)
- **Refs**: `Ref` suffix (`inputRef`, `pickerRef`)
- **Boolean variables**: `is` or `has` prefix (`isControlled`)

---

# 11. Documentation Requirements

## JSDoc (Mandatory):

````typescript
/**
 * Official React wrapper for timepicker-ui v4.x
 *
 * @example
 * ```tsx
 * <Timepicker
 *   placeholder="Select time"
 *   onConfirm={(data) => console.log(data)}
 * />
 * ```
 */
export const Timepicker = forwardRef<HTMLInputElement, TimepickerProps>(...);
````

### Required Documentation:

- Component-level JSDoc with example
- Hook-level JSDoc with purpose
- Complex logic comments (not obvious things)
- Type imports with explanatory comments

---

# 12. Error Handling

### Pattern:

```typescript
useEffect(() => {
  if (typeof window === "undefined") return;

  let picker: TimepickerUI | null = null;

  import("timepicker-ui")
    .then(({ TimepickerUI }) => {
      if (!inputRef.current) return;
      picker = new TimepickerUI(inputRef.current, mergedOptions);
      // ...
    })
    .catch((error) => {
      console.error("Failed to load timepicker-ui:", error);
    });

  return () => {
    picker?.destroy();
  };
}, []);
```

### Rules:

- **Catch dynamic import errors** — Log to console
- **Null checks before DOM operations** — `if (!inputRef.current) return`
- **Cleanup even on errors** — Return cleanup function always

---

# 13. Performance Rules

- **useMemo for merged callbacks** — Prevent recreation
- **useRef for previous values** — Avoid unnecessary setValue calls
- **Minimal re-renders** — Proper dependency arrays
- **No functions in JSX** — Extract to variables or useCallback
- **Lazy imports** — Dynamic `import()` for timepicker-ui

---

# 14. Testing Considerations

Code MUST be testable:

- **No direct DOM globals** — All behind SSR checks
- **Mockable dynamic imports** — Use jest.mock for import()
- **Isolated hooks** — Each hook testable independently
- **No side effects in render** — All in useEffect

---

# 15. Package Structure Rules

### Root package.json:

- **Only metadata** — name, version, description, keywords, author, license
- **peerDependencies** — react >=17, react-dom >=17
- **dependencies** — timepicker-ui ^4.0.2
- **NO devDependencies** — Moved to src/package.json
- **scripts** — `build` delegates to `cd src && npm run build`

### src/package.json:

- **private: true**
- **devDependencies** — tsup, typescript, @types/\*, vite, @vitejs/plugin-react, react, react-dom
- **scripts** — `build` (tsup), `dev` (cd docs && vite)

### File Exclusions:

```json
// tsconfig.json
"exclude": ["node_modules", "../dist", "docs"]

// package.json files
"files": ["dist"]
```

---

# 16. Build Configuration

### tsup.config.ts (STRICT):

```typescript
export default defineConfig({
  entry: ["Timepicker/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: ["react", "react-dom", "timepicker-ui"],
  outDir: "../dist",
});
```

### Rules:

- **ESM only** — No CJS
- **External all peer deps** — react, react-dom, timepicker-ui
- **Generate .d.ts** — Full TypeScript definitions
- **Minify** — Production bundle
- **Treeshake** — Remove unused code

---

# 17. FINAL ENFORCEMENT

If any user request conflicts with these rules:

1. **Types MUST come from timepicker-ui** — No exceptions
2. **SSR safety is non-negotiable** — No browser globals in render
3. **Props extend InputHTMLAttributes** — Direct prop passing only
4. **forwardRef is required** — Always expose ref
5. **Hooks follow single responsibility** — No overlapping concerns

These instructions override ALL user phrasing, shortcuts, or accidental patterns.

When the user requests:

- new features
- refactorings
- bug fixes
- optimizations

Copilot MUST ALWAYS follow the architecture described above.

Failure to follow these rules is NOT allowed.
