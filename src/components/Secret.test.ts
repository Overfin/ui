import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import Secret from './Secret.svelte';
import { toasts } from '../lib/toast.svelte';
import { setLanguage } from '../lib/labels.svelte';
import { frame, render, text } from '../test/render';

const real = Object.getOwnPropertyDescriptor(Navigator.prototype, 'clipboard')!;
afterEach(() => {
  delete (navigator as { clipboard?: unknown }).clipboard;
  Object.defineProperty(Navigator.prototype, 'clipboard', real);
  vi.restoreAllMocks();
});

// What a copy took: the text selected where the browser copies from, the
// field with the focus.
function watchCopy() {
  const copied: string[] = [];
  document.addEventListener('copy', () => {
    const el = document.activeElement as HTMLInputElement | null;
    const sel = el && el.tagName === 'INPUT' ? el.value.slice(el.selectionStart ?? 0, el.selectionEnd ?? 0) : String(document.getSelection());
    copied.push(sel);
  }, { once: true });
  return copied;
}

describe('Secret', () => {
  it('shows the value in a read-only field named by the text above, selected', async () => {
    render(Secret, { value: 'ovs_3f9a1c2b7d', after: 'It won’t be shown again.', children: text('The key, shown once:') });
    await frame();
    const field = page.getByRole('textbox', { name: 'The key, shown once:' });
    await expect.element(field).toHaveValue('ovs_3f9a1c2b7d');
    await expect.element(field).toHaveAttribute('readonly');
    const input = document.querySelector('input')!;
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 14]);
    expect(document.querySelector('.secret .hint')!.textContent).toBe('It won’t be shown again.');
  });

  it('copies with the clipboard, and says so', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(Secret, { value: 'ovs_key', children: text('Key') });
    await page.getByRole('button', { name: 'Copy' }).click();
    await frame();
    expect(writeText).toHaveBeenCalledWith('ovs_key');
    expect(toasts.map((t) => t.text)).toEqual(['Copied.']);
  });

  it('copies over plain HTTP too (no clipboard there): the whole value, the focus back on Copy', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    render(Secret, { value: 'https://panel.example.org/setup/abc123', children: text('Link') });
    await frame();
    const copied = watchCopy();
    const copy = page.getByRole('button', { name: 'Copy' });
    await copy.click();
    await frame();
    expect(copied).toEqual(['https://panel.example.org/setup/abc123']);
    expect(toasts.map((t) => t.text)).toEqual(['Copied.']);
    await expect.element(copy).toHaveFocus();
  });

  it('copies the old way when the clipboard refuses', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) }, configurable: true });
    render(Secret, { value: 'abc', children: text('Key') });
    await frame();
    // The page's selection elsewhere meanwhile.
    (document.activeElement as HTMLElement | null)?.blur();
    const copied = watchCopy();
    await page.getByRole('button', { name: 'Copy' }).click();
    await frame();
    expect(copied).toEqual(['abc']);
  });

  it('says it when nothing could be copied, so the value is copied by hand', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    vi.spyOn(document, 'execCommand').mockReturnValue(false);
    render(Secret, { value: 'abc', children: text('Key') });
    await page.getByRole('button', { name: 'Copy' }).click();
    await frame();
    expect(toasts.map((t) => [t.text, t.error])).toEqual([[expect.stringMatching(/./), true]]);
    expect(toasts[0].text).not.toBe('Copied.');
  });

  it('is in the kit’s language', async () => {
    setLanguage('fr');
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.resolve() }, configurable: true });
    render(Secret, { value: 'abc', children: text('Clé') });
    await page.getByRole('button', { name: 'Copier' }).click();
    await frame();
    expect(toasts.map((t) => t.text)).toEqual(['Copié.']);
  });

  it('keeps a long value inside its box', async () => {
    render(Secret, { value: 'x'.repeat(500), children: text('Key') });
    const box = document.querySelector('.secret')!;
    expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth + 1);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  });
});
