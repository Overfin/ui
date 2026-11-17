import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import FormModal from './FormModal.svelte';
import { frame, html, opener, remove, render } from '../test/render';

function later<T = void>() {
  let resolve!: (v: T) => void, reject!: (e: unknown) => void;
  const promise = new Promise<T>((a, b) => ((resolve = a), (reject = b)));
  return { promise, resolve, reject };
}

function open(save: () => Promise<void> | void, props: Record<string, unknown> = {}) {
  const button = opener('Edit');
  const close = vi.fn(() => remove(app));
  const app = render(FormModal, {
    title: 'Edit Radarr',
    save,
    close,
    children: html('<div class="fields"><label class="field"><span>Name</span><input name="name" value="Radarr" /></label></div>'),
    ...props,
  });
  return { button, close, input: document.querySelector('dialog input') as HTMLInputElement };
}

describe('FormModal', () => {
  it('is a window with its form, the first field focused, Save and Cancel', async () => {
    open(() => {});
    await frame();
    await expect.element(page.getByRole('dialog', { name: 'Edit Radarr' })).toBeVisible();
    expect((document.activeElement as HTMLInputElement).name).toBe('name');
    expect([...document.querySelectorAll('dialog .card-foot button')].map((b) => b.textContent)).toEqual(['Cancel', 'Save']);
  });

  it('saves on Enter in a field, busy meanwhile, then closes and gives the focus back', async () => {
    const wait = later();
    const save = vi.fn(() => wait.promise);
    const { close, button } = open(save);
    await frame();
    await userEvent.keyboard('{Enter}');
    expect(save).toHaveBeenCalledTimes(1);
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('dialog .card-foot button')];
    expect(buttons.every((b) => b.disabled)).toBe(true);
    // Busy: Escape and Enter again do nothing.
    await userEvent.keyboard('{Escape}');
    await userEvent.keyboard('{Enter}');
    expect(close).not.toHaveBeenCalled();
    expect(save).toHaveBeenCalledTimes(1);
    wait.resolve();
    await frame();
    expect(close).toHaveBeenCalledTimes(1);
    await frame();
    expect(document.activeElement).toBe(button);
  });

  it('says a failure in the window, which stays open, the focus kept in it', async () => {
    const { close } = open(() => Promise.reject(new Error('The service did not answer.')));
    await page.getByRole('button', { name: 'Save' }).click();
    await frame();
    await expect.element(page.getByRole('alert')).toHaveTextContent('The service did not answer.');
    expect(close).not.toHaveBeenCalled();
    const d = document.querySelector('dialog')!;
    expect(d.contains(document.activeElement)).toBe(true);
    // Saved again: the failure goes.
    await page.getByRole('button', { name: 'Save' }).click();
    await frame();
  });

  it('says something for a failure without a message', async () => {
    open(() => Promise.reject(new Error('')));
    await page.getByRole('button', { name: 'Save' }).click();
    await frame();
    await expect.element(page.getByRole('alert')).toHaveTextContent('Something went wrong.');
  });

  it('checks the fields before saving: a required one empty, nothing is sent', async () => {
    const save = vi.fn();
    open(save, { children: html('<div><input name="url" required /></div>') });
    await page.getByRole('button', { name: 'Save' }).click();
    expect(save).not.toHaveBeenCalled();
  });

  it('takes its own save label, danger, other buttons, and Cancel closes', async () => {
    const save = vi.fn();
    const { close } = open(save, { saveLabel: 'Delete', danger: true, wide: true, more: html('<button type="button">Test</button>') });
    expect([...document.querySelectorAll('dialog .card-foot button')].map((b) => b.textContent)).toEqual(['Test', 'Cancel', 'Delete']);
    expect(document.querySelector('dialog button[type=submit]')!.classList.contains('danger')).toBe(true);
    expect(document.querySelector('dialog')!.classList.contains('wide')).toBe(true);
    await page.getByRole('button', { name: 'Cancel' }).click();
    expect(close).toHaveBeenCalledTimes(1);
    expect(save).not.toHaveBeenCalled();
  });
});
