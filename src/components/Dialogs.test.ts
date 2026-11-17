import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import Dialogs from './Dialogs.svelte';
import { ask, tell } from '../lib/dialog.svelte';
import { setLanguage } from '../lib/labels.svelte';
import { frame, opener, render } from '../test/render';

async function shown() {
  await frame();
  return document.querySelector<HTMLDialogElement>('dialog.modal')!;
}

describe('Dialogs', () => {
  it('shows nothing until asked', () => {
    render(Dialogs, {});
    expect(document.querySelector('dialog')).toBeNull();
  });

  it('asks in an alert dialog, its message as the description, Confirm focused', async () => {
    render(Dialogs, {});
    const button = opener('Run');
    const answer = ask('Search again now?', { title: 'Search' });
    const d = await shown();
    await expect.element(page.getByRole('alertdialog', { name: 'Search' })).toHaveAccessibleDescription('Search again now?');
    expect(document.activeElement?.textContent).toBe('Confirm');
    expect(d.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard('{Enter}');
    expect(await answer).toBe(true);
    await frame();
    expect(document.querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('puts the focus on Cancel for something that deletes, and Space answers no', async () => {
    render(Dialogs, {});
    opener();
    const answer = ask('Delete Radarr?', { yes: 'Delete', danger: true });
    await shown();
    expect(document.activeElement?.textContent).toBe('Cancel');
    expect(document.querySelector('dialog button.danger')?.textContent).toBe('Delete');
    await userEvent.keyboard(' ');
    expect(await answer).toBe(false);
  });

  it('answers no on Escape and on the close button', async () => {
    render(Dialogs, {});
    const button = opener();
    const first = ask('First?');
    await shown();
    await userEvent.keyboard('{Escape}');
    expect(await first).toBe(false);
    await frame();
    expect(document.activeElement).toBe(button);
    const second = ask('Second?');
    await shown();
    await page.getByRole('button', { name: 'Close' }).click();
    expect(await second).toBe(false);
  });

  it('tells with only OK, in the kit’s language', async () => {
    setLanguage('fr');
    render(Dialogs, {});
    const done = tell('Terminé', 'Rien de nouveau.');
    await shown();
    expect([...document.querySelectorAll('dialog .card-foot button')].map((b) => b.textContent)).toEqual(['OK']);
    expect(document.activeElement?.textContent).toBe('OK');
    await userEvent.keyboard('{Enter}');
    await expect(done).resolves.toBeUndefined();
  });

  it('a question asked over another replaces it, the first answered no', async () => {
    render(Dialogs, {});
    const first = ask('First?');
    await shown();
    const second = ask('Second?', { danger: true });
    await frame();
    expect(await first).toBe(false);
    expect(document.querySelectorAll('dialog').length).toBe(1);
    expect(document.querySelector('dialog p.ask')?.textContent).toBe('Second?');
    expect(document.activeElement?.textContent).toBe('Cancel');
    await userEvent.keyboard('{Escape}');
    expect(await second).toBe(false);
  });

  it('keeps a long message inside the window, and right-to-left text as it is', async () => {
    render(Dialogs, {});
    void ask('מחק את הקובץ? ' + 'x'.repeat(300));
    const d = await shown();
    expect(d.scrollWidth).toBeLessThanOrEqual(d.clientWidth + 1);
  });
});
