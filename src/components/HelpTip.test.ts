import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import HelpTip from './HelpTip.svelte';
import Modal from './Modal.svelte';
import { setLanguage } from '../lib/labels.svelte';
import { frame, html, remove, render } from '../test/render';

const say = 'Titles in your list that this server is about to remove.';

describe('HelpTip', () => {
  it('is a button named “What’s this?”, closed at first', async () => {
    render(HelpTip, { text: say });
    const b = page.getByRole('button', { name: 'What’s this?'.replace('’', "'") });
    await expect.element(b).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('.bubble')).toBeNull();
  });

  it('takes its own name, and the kit’s language', async () => {
    setLanguage('fr');
    render(HelpTip, { text: say });
    render(HelpTip, { text: say, label: 'About Last chance' });
    await expect.element(page.getByRole('button', { name: 'Qu’est-ce que c’est ?' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'About Last chance' })).toBeVisible();
  });

  it('opens and closes on a click, Enter and Space, saying what it controls', async () => {
    render(HelpTip, { text: say });
    const b = document.querySelector<HTMLButtonElement>('.mark')!;
    await userEvent.click(b);
    expect(b.getAttribute('aria-expanded')).toBe('true');
    const bubble = document.getElementById(b.getAttribute('aria-controls')!)!;
    expect(bubble.textContent).toBe(say);
    await userEvent.click(b);
    expect(b.getAttribute('aria-expanded')).toBe('false');
    b.focus();
    await userEvent.keyboard('{Enter}');
    expect(b.getAttribute('aria-expanded')).toBe('true');
    await userEvent.keyboard(' ');
    expect(b.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape, the focus staying on it', async () => {
    render(HelpTip, { text: say });
    const b = document.querySelector<HTMLButtonElement>('.mark')!;
    b.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Escape}');
    expect(b.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(b);
  });

  it('closes on a click elsewhere, not on its own text', async () => {
    render(HelpTip, { text: say });
    const b = document.querySelector<HTMLButtonElement>('.mark')!;
    await userEvent.click(b);
    await userEvent.click(document.querySelector('.bubble')!);
    expect(b.getAttribute('aria-expanded')).toBe('true');
    await userEvent.click(document.body, { position: { x: 600, y: 600 } });
    expect(b.getAttribute('aria-expanded')).toBe('false');
  });

  it('in a window, Escape closes the help first, not the window', async () => {
    const close = vi.fn(() => remove(app));
    const app = render(Modal, { title: 'A window', close, children: html('<div class="spot"></div>') });
    render(HelpTip, { text: say }, document.querySelector('.spot')!);
    const b = document.querySelector<HTMLButtonElement>('.mark')!;
    b.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Escape}');
    expect(b.getAttribute('aria-expanded')).toBe('false');
    expect(close).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('keeps its text on the screen near the right edge (a phone)', async () => {
    const spot = document.createElement('div');
    spot.className = 'edge';
    document.body.append(spot);
    const s = document.createElement('style');
    s.textContent = '.edge { position: absolute; right: 2px; top: 10px; }';
    document.head.append(s);
    render(HelpTip, { text: say.repeat(3) }, spot);
    await userEvent.click(document.querySelector('.mark')!);
    await frame();
    const r = document.querySelector('.bubble')!.getBoundingClientRect();
    expect(r.right).toBeLessThanOrEqual(document.documentElement.clientWidth);
    expect(r.left).toBeGreaterThanOrEqual(0);
  });

  it('opens one at a time', async () => {
    render(HelpTip, { text: 'one' });
    render(HelpTip, { text: 'two' });
    const [a, b] = document.querySelectorAll<HTMLButtonElement>('.mark');
    await userEvent.click(a);
    await userEvent.click(b);
    expect(a.getAttribute('aria-expanded')).toBe('false');
    expect(b.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('HelpTip, the focus elsewhere', () => {
  it('Escape in a window opened from the keyboard closes the help and the window together', async () => {
    render(HelpTip, { text: say });
    await userEvent.click(document.querySelector('.mark')!);
    const close = vi.fn(() => remove(app));
    const app = render(Modal, { title: 'A window', close, children: html('<div><input /></div>') });
    await frame();
    await userEvent.keyboard('{Escape}');
    expect(close).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.mark')!.getAttribute('aria-expanded')).toBe('false');
  });
});
