import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import Modal from './Modal.svelte';
import { setLanguage } from '../lib/labels.svelte';
import { frame, html, opener, remove, render } from '../test/render';

// A window as a page opens one: from a button, closed by taking it away.
function open(props: Partial<Parameters<typeof render>[1]> = {}, body = '<p>What it holds.</p>') {
  const button = opener();
  const close = vi.fn(() => remove(app));
  const app = render(Modal, { title: 'A window', close, children: html(body), ...props });
  const dialog = document.querySelector<HTMLDialogElement>('dialog.modal')!;
  return { button, close, app, dialog };
}

describe('Modal', () => {
  it('is a modal dialog named by its title, described by its description', async () => {
    const { dialog } = open({ description: 'Its address.' });
    expect(dialog.open).toBe(true);
    expect(dialog.matches(':modal')).toBe(true);
    await expect.element(page.getByRole('dialog', { name: 'A window' })).toBeVisible();
    await expect.element(page.getByRole('dialog')).toHaveAccessibleDescription('Its address.');
    expect(document.documentElement.classList.contains('modal-open')).toBe(true);
  });

  it('is an alert dialog for a question, described by what it asks', async () => {
    open({ alert: true, size: 'small' }, '<p>Delete Radarr?</p>');
    await expect.element(page.getByRole('alertdialog', { name: 'A window' })).toHaveAccessibleDescription('Delete Radarr?');
    expect(document.querySelector('dialog')!.classList.contains('small')).toBe(true);
  });

  it('has a close button in the kit’s language', async () => {
    setLanguage('fr');
    const { close } = open();
    await page.getByRole('button', { name: 'Fermer' }).click();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape, and gives the focus back to the button it was opened from', async () => {
    const { button, close } = open();
    await userEvent.keyboard('{Escape}');
    expect(close).toHaveBeenCalledTimes(1);
    expect(document.querySelector('dialog')).toBeNull();
    await frame();
    expect(document.activeElement).toBe(button);
    expect(document.documentElement.classList.contains('modal-open')).toBe(false);
  });

  it('calls close once, not again when the dialog is taken away', async () => {
    const { close } = open();
    await page.getByRole('button', { name: 'Close' }).click();
    await frame();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('stays open on Escape, twice, and a click outside while busy', async () => {
    const { close, dialog } = open({ busy: true });
    await userEvent.keyboard('{Escape}');
    await userEvent.keyboard('{Escape}');
    await frame();
    expect(dialog.open).toBe(true);
    expect(dialog.isConnected).toBe(true);
    await userEvent.click(document.body, { position: { x: 5, y: 5 }, force: true });
    expect(close).not.toHaveBeenCalled();
  });

  it('closes on a click outside, on the darkened page', async () => {
    const { close } = open();
    await userEvent.click(document.documentElement, { position: { x: 5, y: 5 }, force: true });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('stays open on a click inside it, between its parts, where the window itself is under the pointer', async () => {
    const { close, dialog } = open({ foot: html('<button>Done</button>') }, '<p>What it holds.</p>');
    const r = dialog.getBoundingClientRect();
    // Its padding, at the left edge inside the window.
    await userEvent.click(dialog, { position: { x: 4, y: r.height / 2 } });
    expect(close).not.toHaveBeenCalled();
  });

  it('stays open when text selected in a field is let go outside the window', async () => {
    const { close, dialog } = open({}, '<div><input value="a long address to select" /></div>');
    const input = dialog.querySelector('input')!;
    const r = input.getBoundingClientRect();
    // Pressed in the field, let go on the darkened page: the browser says
    // click on the window, the common parent.
    input.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.left + 5, clientY: r.top + 5 }));
    input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: r.left + 5, clientY: r.top + 5 }));
    dialog.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 3, clientY: 3 }));
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 3, clientY: 3 }));
    expect(close).not.toHaveBeenCalled();
  });

  it('gives the focus to the first field it can, skipping hidden and disabled ones and switches', async () => {
    open({}, '<div><input type="hidden" name="h" /><input type="checkbox" /><input disabled /><input readonly value="r" /><input id="first" /></div>');
    await frame();
    expect(document.activeElement?.id).toBe('first');
  });

  it('takes the Tab key from its field to its own buttons, not the page behind', async () => {
    const { dialog, button } = open({ foot: html('<button id="done">Done</button>') }, '<div><input id="a" /></div>');
    await frame();
    expect(document.activeElement?.id).toBe('a');
    await userEvent.tab();
    expect(document.activeElement?.id).toBe('done');
    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(button);
  });

  it('opened over another, darkens the page once, and each gives the focus back in turn', async () => {
    const first = open({ title: 'First' }, '<div><button id="inner">Open the second</button></div>');
    const inner = document.getElementById('inner')!;
    inner.focus();
    const close2 = vi.fn(() => remove(second));
    const second = render(Modal, { title: 'Second', close: close2, children: html('<p>Over it.</p>') });
    const dialogs = document.querySelectorAll('dialog.modal');
    expect(dialogs[1].classList.contains('stacked')).toBe(true);
    expect(dialogs[0].classList.contains('stacked')).toBe(false);
    await userEvent.keyboard('{Escape}');
    expect(close2).toHaveBeenCalledTimes(1);
    expect(first.close).not.toHaveBeenCalled();
    await frame();
    expect(document.activeElement).toBe(inner);
    expect(document.documentElement.classList.contains('modal-open')).toBe(true);
    await userEvent.keyboard('{Escape}');
    await frame();
    expect(document.activeElement).toBe(first.button);
    expect(document.documentElement.classList.contains('modal-open')).toBe(false);
  });

  it('a window opened right after one closed sends the focus back to the first one’s button', async () => {
    const { button, app } = open();
    remove(app);
    // Opened at once, the focus on nothing yet.
    (document.activeElement as HTMLElement | null)?.blur();
    const close = vi.fn(() => remove(next));
    const next = render(Modal, { title: 'Result', close, children: html('<p>Done.</p>') });
    await userEvent.keyboard('{Escape}');
    await frame();
    expect(document.activeElement).toBe(button);
  });

  it('wraps a long title and keeps a right-to-left one as it is', async () => {
    document.documentElement.dir = 'rtl';
    const { dialog } = open({ title: 'חלון '.repeat(3) + 'x'.repeat(200) });
    expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth + 1);
  });
});
