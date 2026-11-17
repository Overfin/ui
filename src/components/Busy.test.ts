import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import Busy from './Busy.svelte';
import Dialogs from './Dialogs.svelte';
import { ask } from '../lib/dialog.svelte';
import { toasts } from '../lib/toast.svelte';
import { frame, render, text } from '../test/render';

function later() {
  let resolve!: () => void;
  const promise = new Promise<void>((a) => (resolve = a));
  return { promise, resolve };
}

describe('Busy', () => {
  it('is disabled while its action runs, once only however often it’s clicked', async () => {
    const wait = later();
    const action = vi.fn(() => wait.promise);
    render(Busy, { action, kind: 'primary', children: text('Save') });
    const b = document.querySelector('button')!;
    expect(b.classList.contains('primary')).toBe(true);
    await userEvent.click(b);
    expect(b.disabled).toBe(true);
    b.click();
    expect(action).toHaveBeenCalledTimes(1);
    wait.resolve();
    await frame();
    expect(b.disabled).toBe(false);
  });

  it('runs on Enter and Space from the keyboard', async () => {
    const action = vi.fn();
    render(Busy, { action, children: text('Run') });
    document.querySelector('button')!.focus();
    await userEvent.keyboard('{Enter}');
    await frame();
    await userEvent.keyboard(' ');
    await frame();
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('says a failure in a red toast, or by its own fail', async () => {
    render(Busy, { action: () => Promise.reject(new Error('Prowlarr did not answer.')), children: text('A') });
    const fail = vi.fn();
    render(Busy, { action: () => { throw 'plain'; }, fail, children: text('B') });
    await page.getByRole('button', { name: 'A' }).click();
    await page.getByRole('button', { name: 'B' }).click();
    await frame();
    expect(toasts.map((t) => [t.text, t.error])).toEqual([['Prowlarr did not answer.', true]]);
    expect(fail).toHaveBeenCalledWith(new Error('plain'));
  });

  it('says something for a failure without a message', async () => {
    render(Busy, { action: () => Promise.reject(new Error('')), children: text('A') });
    await page.getByRole('button', { name: 'A' }).click();
    await frame();
    expect(toasts.map((t) => [t.text, t.error])).toEqual([['Something went wrong.', true]]);
  });

  it('keeps the focus once done, ready to be pressed again from the keyboard', async () => {
    const action = () => new Promise((r) => setTimeout(r, 50));
    render(Busy, { action, children: text('Run') });
    const b = document.querySelector('button')!;
    b.focus();
    await userEvent.keyboard('{Enter}');
    await new Promise((r) => setTimeout(r, 120));
    await frame();
    expect(document.activeElement).toBe(b);
  });

  it('takes a name for screen readers and a hover text', async () => {
    render(Busy, { action: () => {}, label: 'Search Radarr again', title: 'Search again', small: true, children: text('↻') });
    const b = page.getByRole('button', { name: 'Search Radarr again' });
    await expect.element(b).toHaveAttribute('title', 'Search again');
    await expect.element(b).toHaveClass('small');
  });

  it('can be disabled', async () => {
    const action = vi.fn();
    render(Busy, { action, disabled: true, children: text('A') });
    expect(document.querySelector('button')!.disabled).toBe(true);
    document.querySelector('button')!.click();
    expect(action).not.toHaveBeenCalled();
  });

  it('gets the focus back after a confirmation it asked closed', async () => {
    render(Dialogs, {});
    render(Busy, { action: () => ask('Sure?'), children: text('Delete') });
    const b = document.querySelector<HTMLButtonElement>('button')!;
    b.focus();
    await userEvent.keyboard('{Enter}');
    await frame();
    expect(document.querySelector('dialog')).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    await frame();
    await frame();
    expect(document.activeElement).toBe(b);
  });
});
