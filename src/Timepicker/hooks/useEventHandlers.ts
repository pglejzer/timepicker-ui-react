import { useCallback, useMemo, useRef } from "react";
import type { CallbacksOptions } from "timepicker-ui";
import { CALLBACK_EVENTS } from "../callbacks";
import type { CallbackName, ReactCallbacks } from "../callbacks";
import type { TimepickerInstance } from "../types";

type Handler = (data: unknown) => void;
type Binding = readonly [
  event: (typeof CALLBACK_EVENTS)[number][1],
  handler: Handler,
];

const callbackOf = (
  source: CallbacksOptions | undefined,
  name: CallbackName,
) => source?.[name] as Handler | undefined;

const mergeCallbacks = (
  react: ReactCallbacks,
  opts?: CallbacksOptions,
): Binding[] => {
  const bindings: Binding[] = [];

  for (const [name, event] of CALLBACK_EVENTS) {
    const fromOptions = callbackOf(opts, name);
    const fromReact = callbackOf(react, name);

    if (fromOptions || fromReact) {
      bindings.push([
        event,
        (data) => {
          fromOptions?.(data);
          fromReact?.(data);
        },
      ]);
    }
  }

  return bindings;
};

export const useEventHandlers = (
  reactCallbacks: ReactCallbacks,
  optionsCallbacks?: CallbacksOptions,
) => {
  const bindings = useMemo(
    () => mergeCallbacks(reactCallbacks, optionsCallbacks),
    [
      optionsCallbacks,
      ...CALLBACK_EVENTS.map(([name]) => reactCallbacks[name]),
    ],
  );

  const attachedRef = useRef<readonly Binding[]>([]);

  const attach = useCallback(
    (picker: TimepickerInstance) => {
      bindings.forEach(([event, handler]) => picker.on(event, handler));
      attachedRef.current = bindings;
    },
    [bindings],
  );

  const detach = useCallback((picker: TimepickerInstance) => {
    attachedRef.current.forEach(([event, handler]) =>
      picker.off(event, handler),
    );
    attachedRef.current = [];
  }, []);

  return { attachEventHandlers: attach, detachEventHandlers: detach };
};
