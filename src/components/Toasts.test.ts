import { describe, expect, it, vi } from 'vitest';
import Toasts from './Toasts.svelte';
import Modal from './Modal.svelte';
import { toast, toasts } from '../lib/toast.svelte';
import { drawn, frame, html, remove, render, rgb } from '../test/render';

// Whether a message is seen: the color on the screen inside its edge is its
// own, not the window's or the darkened page's. (Hit-testing can't say: a
// modal window makes everything else inert, the top layer too.)
async function onTop(el: Element): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 250)); // its entrance, done
  const r = el.getBoundingClientRect();
  const want = rgb(getComputedStyle(el).backgroundColor);
  const got = await drawn(r.left + 6, r.top + r.height / 2);
  return got.every((c, i) => Math.abs(c - want[i]) <= 3);
}

// A window that covers the whole corner where the messages are.
function bigWindow() {
  const close = vi.fn(() => remove(app));
  const app = render(Modal, { title: 'A window', size: 'wide', close, children: html('<div class="tall"></div>') });
  const d = document.querySelector<HTMLDialogElement>('dialog')!;
  d.classList.add('cover');
  return { app, dialog: d };
}

const cover = document.createElement('style');
cover.textContent = 'dialog.modal.cover { width: 100vw; max-width: none; height: 100vh; max-height: none; margin: 0; inset: 0; }';
document.head.append(cover);

describe('Toasts', () => {
  it('shows each message, an error in red, out of reach of screen readers but read from a region always there', async () => {
    render(Toasts, {});
    const region = document.querySelector('[role=status][aria-live=polite]')!;
    expect(region.textContent).toBe('');
    toast('Saved.');
    toast('It failed.', true);
    await frame();
    const shown = [...document.querySelectorAll('.toasts .toast')];
    expect(shown.map((t) => [t.textContent, t.classList.contains('error')])).toEqual([['Saved.', false], ['It failed.', true]]);
    expect(document.querySelector('.toasts')!.getAttribute('aria-hidden')).toBe('true');
    expect(region.textContent).toBe('It failed.');
    expect(region.isConnected).toBe(true);
  });

  it('are hidden when there are none', async () => {
    render(Toasts, {});
    toast('a');
    await frame();
    expect(document.querySelector('.toasts')!.matches(':popover-open')).toBe(true);
    toasts.splice(0);
    await frame();
    expect(document.querySelector('.toasts')!.matches(':popover-open')).toBe(false);
  });

  it('(the check itself) sees a message on the page, and not one a window covers', async () => {
    render(Toasts, {});
    toast('Saved.');
    await frame();
    expect(await onTop(document.querySelector('.toast')!)).toBe(true);
    // The same message, out of the top layer: a window hides it.
    const plain = document.createElement('div');
    plain.className = 'toasts';
    plain.innerHTML = '<div class="toast">Saved.</div>';
    document.body.append(plain);
    toasts.splice(0);
    await frame();
    bigWindow();
    await frame();
    expect(await onTop(plain.querySelector('.toast')!)).toBe(false);
  });

  it('come above a window opened before them: a failure said from a form is seen', async () => {
    render(Toasts, {});
    bigWindow();
    toast('The service did not answer.', true);
    await frame();
    expect(await onTop(document.querySelector('.toast')!)).toBe(true);
  });

  it('come above a window opened after them', async () => {
    render(Toasts, {});
    toast('Saved.');
    await frame();
    bigWindow();
    await frame();
    expect(await onTop(document.querySelector('.toast')!)).toBe(true);
  });

  it('come above a window opened over another, and stay once it closes', async () => {
    render(Toasts, {});
    bigWindow();
    toast('Saved.');
    await frame();
    const second = bigWindow();
    await frame();
    expect(await onTop(document.querySelector('.toast')!)).toBe(true);
    remove(second.app);
    await frame();
    expect(await onTop(document.querySelector('.toast')!)).toBe(true);
  });

  it('inside an open window, the newest message is read out from the window', async () => {
    render(Toasts, {});
    bigWindow();
    toast('Copied.');
    await frame();
    const inside = document.querySelector('dialog [role=status][aria-live=polite]')!;
    expect(inside.textContent).toBe('Copied.');
  });

  it('keep a long message inside the screen', async () => {
    render(Toasts, {});
    toast('/mnt/media/' + 'very-long-folder-name/'.repeat(20) + 'file.mkv could not be removed', true);
    await frame();
    const r = document.querySelector('.toast')!.getBoundingClientRect();
    expect(r.left).toBeGreaterThanOrEqual(0);
    expect(r.right).toBeLessThanOrEqual(window.innerWidth);
  });
});

describe('an error toast', () => {
  it('keeps its words in the text color, the red in its dot and edge', async () => {
    render(Toasts, {});
    toast('It failed.', true);
    await frame();
    const t = document.querySelector('.toast.error')!;
    const probe = document.createElement('span');
    probe.style.color = 'var(--text)';
    document.body.append(probe);
    expect(getComputedStyle(t).color).toBe(getComputedStyle(probe).color);
    const dot = getComputedStyle(t, '::before').backgroundColor;
    probe.style.color = 'var(--danger)';
    expect(dot).toBe(getComputedStyle(probe).color);
  });
});
