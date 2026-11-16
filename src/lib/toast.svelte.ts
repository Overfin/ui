// Short messages in the corner, for a few seconds: "Saved.", or what went
// wrong. <Toasts /> shows them.
export interface Toast {
  id: number;
  text: string;
  error: boolean;
}

export const toasts = $state<Toast[]>([]);

// What screen readers are told: the newest message, when it comes (never
// an older one again when a newer goes first); a message said twice in a
// row gets an invisible mark, so it's read twice.
export const said = $state<{ text: string }>({ text: '' });

let next = 0;

/** toast shows text for 3.5 seconds, or 7 for an error. */
export function toast(text: string, error = false) {
  const id = ++next;
  toasts.push({ id, text, error });
  said.text = said.text === text ? text + '\u200b' : text;
  setTimeout(() => {
    const i = toasts.findIndex((t) => t.id === id);
    if (i >= 0) toasts.splice(i, 1);
  }, error ? 7000 : 3500);
}
