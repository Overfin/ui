// Short messages in the corner, for a few seconds: "Saved.", or what went
// wrong. <Toasts /> shows them.
export interface Toast {
  id: number;
  text: string;
  error: boolean;
}

export const toasts = $state<Toast[]>([]);

let next = 0;

/** toast shows text for 3.5 seconds, or 7 for an error. */
export function toast(text: string, error = false) {
  const id = ++next;
  toasts.push({ id, text, error });
  setTimeout(() => {
    const i = toasts.findIndex((t) => t.id === id);
    if (i >= 0) toasts.splice(i, 1);
  }, error ? 7000 : 3500);
}
