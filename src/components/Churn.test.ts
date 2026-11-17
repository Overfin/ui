// Components opened, closed and updated fast, many times over: nothing left
// behind (listeners on the document, windows, the page held still), the
// focus where it should be, and no stale state.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import Modal from './Modal.svelte';
import FormModal from './FormModal.svelte';
import HelpTip from './HelpTip.svelte';
import Toasts from './Toasts.svelte';
import Dialogs from './Dialogs.svelte';
import Tabs from '../test/TabsHarness.svelte';
import { ask } from '../lib/dialog.svelte';
import { toast, toasts } from '../lib/toast.svelte';
import { frame, html, opener, remove, render } from '../test/render';

// Counts what is listened to on the document, added minus removed.
let live = new Map<string, number>();
const add = document.addEventListener.bind(document);
const del = document.removeEventListener.bind(document);
beforeEach(() => {
  live = new Map();
  vi.spyOn(document, 'addEventListener').mockImplementation((type: string, fn: EventListenerOrEventListenerObject, o?: boolean | AddEventListenerOptions) => {
    live.set(type, (live.get(type) ?? 0) + 1);
    add(type, fn, o);
  });
  vi.spyOn(document, 'removeEventListener').mockImplementation((type: string, fn: EventListenerOrEventListenerObject, o?: boolean | EventListenerOptions) => {
    live.set(type, (live.get(type) ?? 0) - 1);
    del(type, fn, o);
  });
});
afterEach(() => vi.restoreAllMocks());
const left = () => [...live].filter(([, n]) => n !== 0);

describe('many times over', () => {
  it('a window opened and closed 500 times leaves nothing behind, and the focus on its button', async () => {
    render(Toasts, {});
    const button = opener();
    const before = left();
    for (let i = 0; i < 500; i++) {
      const app = render(Modal, { title: `W${i}`, close: () => {}, children: html('<div><input /></div>') });
      remove(app);
    }
    await frame();
    expect(document.querySelectorAll('dialog').length).toBe(0);
    expect(document.documentElement.classList.contains('modal-open')).toBe(false);
    expect(left()).toEqual(before);
    expect(document.activeElement).toBe(button);
  });

  it('a form saved and failed 200 times keeps one window and says the last failure', async () => {
    let n = 0;
    const save = () => Promise.reject(new Error(`Failure ${++n}`));
    render(FormModal, { title: 'F', save, close: () => {}, children: html('<div><input /></div>') });
    const form = document.querySelector('form')!;
    for (let i = 0; i < 200; i++) {
      form.requestSubmit();
      await Promise.resolve();
      await new Promise((r) => setTimeout(r, 0));
    }
    await frame();
    expect(document.querySelectorAll('dialog').length).toBe(1);
    expect(document.querySelector('[role=alert]')!.textContent).toBe('Failure 200');
    expect(document.querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(false);
  });

  it('the help opened and closed 500 times leaves no listener', async () => {
    render(HelpTip, { text: 'x' });
    const before = left();
    const mark = document.querySelector<HTMLButtonElement>('.mark')!;
    for (let i = 0; i < 500; i++) {
      mark.click();
      flushSync();
    }
    expect(mark.getAttribute('aria-expanded')).toBe('false');
    expect(left()).toEqual(before);
  });

  it('a help left open when taken away leaves no listener', () => {
    const before = left();
    const app = render(HelpTip, { text: 'x' });
    document.querySelector<HTMLButtonElement>('.mark')!.click();
    flushSync();
    remove(app);
    expect(left()).toEqual(before);
  });

  it('500 messages at once: all shown, read out the last, gone after their time', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    try {
      render(Toasts, {});
      for (let i = 0; i < 500; i++) toast(`m${i}`, i % 2 === 0);
      flushSync();
      expect(document.querySelectorAll('.toast').length).toBe(500);
      expect(document.querySelector('[role=status]')!.textContent).toBe('m499');
      vi.advanceTimersByTime(7000);
      flushSync();
      expect(toasts.length).toBe(0);
      expect(document.querySelectorAll('.toast').length).toBe(0);
      expect(document.querySelector('.toasts')!.matches(':popover-open')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('questions asked 300 times over each other: each earlier one answered no, one window', async () => {
    render(Dialogs, {});
    const answers: Promise<boolean>[] = [];
    for (let i = 0; i < 300; i++) answers.push(ask(`Q${i}`));
    flushSync();
    await frame();
    expect(document.querySelectorAll('dialog').length).toBe(1);
    expect(document.querySelector('p.ask')!.textContent).toBe('Q299');
    const settled = await Promise.race([Promise.all(answers.slice(0, -1)), new Promise((r) => setTimeout(() => r('waiting'), 500))]);
    expect(settled).toEqual(Array(299).fill(false));
  });

  it('tabs switched 500 times show the last one chosen, one panel', () => {
    const tabs = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }];
    render(Tabs, { tabs, current: 'a' });
    const buttons = document.querySelectorAll<HTMLButtonElement>('[role=tab]');
    for (let i = 0; i < 500; i++) {
      buttons[i % 3].click();
      flushSync();
    }
    expect(document.querySelectorAll('[role=tabpanel]').length).toBe(1);
    expect(document.querySelector('.shown')!.textContent).toBe(`Part ${tabs[499 % 3].id}`);
    expect([...buttons].filter((b) => b.tabIndex === 0).length).toBe(1);
  });
});
