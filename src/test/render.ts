// Mounting a component for a test, as a panel's page does, and the little
// helpers the tests share.
import { createRawSnippet, flushSync, mount, unmount, type Component, type Snippet } from 'svelte';
import { dialog } from '../lib/dialog.svelte';
import { toasts } from '../lib/toast.svelte';
import { setLanguage } from '../lib/labels.svelte';

const mounted: Record<string, unknown>[] = [];

/** render mounts a component in the page; cleanup takes it away after the test. */
export function render<P extends Record<string, unknown>>(component: Component<P>, props: P): Record<string, unknown> {
  const app = mount(component, { target: document.body, props });
  mounted.push(app);
  flushSync();
  return app;
}

/** remove takes one mounted component away, as a page does when it's done. */
export function remove(app: Record<string, unknown>) {
  const i = mounted.indexOf(app);
  if (i >= 0) mounted.splice(i, 1);
  unmount(app);
  flushSync();
}

export function cleanup() {
  for (const app of mounted.splice(0)) unmount(app);
  flushSync();
  dialog.current = null;
  toasts.splice(0);
  setLanguage('en');
  document.body.replaceChildren();
  document.documentElement.className = '';
  document.documentElement.removeAttribute('dir');
}

/** html is a snippet of some markup (one element), for a component's children. */
export function html(markup: string): Snippet {
  return createRawSnippet(() => ({ render: () => markup }));
}

/** text is a snippet of plain text, escaped. */
export function text(words: string): Snippet {
  const escaped = words.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  return html(`<span>${escaped}</span>`);
}

/** frame waits for the browser to draw (the kit returns focus then). */
export function frame(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
}

/** button adds a plain button to the page, the one a window is opened from. */
export function opener(label = 'Open'): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  document.body.append(b);
  b.focus();
  return b;
}
