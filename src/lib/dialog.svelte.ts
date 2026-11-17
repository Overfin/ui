// The panels' own confirmations, instead of the browser's confirm(): in a
// window like the others, translated. <Dialogs /> shows them.
import { word } from './labels.svelte';

export interface Question {
  title: string;
  message: string;
  yes: string;
  danger: boolean;
  notice: boolean;
  resolve: (yes: boolean) => void;
}

export const dialog = $state<{ current: Question | null }>({ current: null });

// One question at a time: a new one answers the one still up with no, so
// whoever waits on it (a busy button, say) is never left waiting.
function put(q: Question) {
  const before = dialog.current;
  dialog.current = q;
  before?.resolve(false);
}

export interface AskOptions {
  title?: string;
  yes?: string;
  /** danger: it deletes or stops something; Cancel gets the focus. */
  danger?: boolean;
}

/** ask asks before something is done: true once confirmed. */
export function ask(message: string, options: AskOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    put({
      title: options.title ?? word('sure'),
      message,
      yes: options.yes ?? word('confirm'),
      danger: options.danger ?? false,
      notice: false,
      resolve,
    });
  });
}

/** tell says something, until it's closed. */
export function tell(title: string, message: string): Promise<void> {
  return new Promise((resolve) => {
    put({ title, message, yes: word('ok'), danger: false, notice: true, resolve: () => resolve() });
  });
}
