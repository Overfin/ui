// Escape with things open one over the other: a form, a question asked
// from it, the help inside it. Each Escape closes the top one only, and the
// focus goes back down step by step to the button the form came from.
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import FormModal from './FormModal.svelte';
import Dialogs from './Dialogs.svelte';
import HelpTip from './HelpTip.svelte';
import Toasts from './Toasts.svelte';
import { ask } from '../lib/dialog.svelte';
import { frame, html, opener, remove, render } from '../test/render';

describe('Escape, layer by layer', () => {
  it('closes the question, then the help, then the form, the focus following', async () => {
    render(Dialogs, {});
    render(Toasts, {});
    const start = opener('Edit');
    const close = vi.fn(() => remove(app));
    const app = render(FormModal, { title: 'Edit', save: () => {}, close, children: html('<div><input /><span class="tip"></span><button type="button" class="asker">Reset</button></div>') });
    render(HelpTip, { text: 'What resetting does.' }, document.querySelector('.tip')!);
    const asker = document.querySelector<HTMLButtonElement>('.asker')!;
    let answer: Promise<boolean> | undefined;
    asker.onclick = () => (answer = ask('Reset?'));
    asker.focus();
    await userEvent.keyboard('{Enter}');
    await frame();
    expect(document.querySelectorAll('dialog[open]').length).toBe(2);

    await userEvent.keyboard('{Escape}');
    expect(await answer).toBe(false);
    await frame();
    expect(document.querySelectorAll('dialog[open]').length).toBe(1);
    expect(document.activeElement).toBe(asker);

    const mark = document.querySelector<HTMLButtonElement>('.mark')!;
    mark.focus();
    await userEvent.keyboard('{Enter}');
    expect(mark.getAttribute('aria-expanded')).toBe('true');
    await userEvent.keyboard('{Escape}');
    expect(mark.getAttribute('aria-expanded')).toBe('false');
    expect(close).not.toHaveBeenCalled();

    await userEvent.keyboard('{Escape}');
    expect(close).toHaveBeenCalledTimes(1);
    await frame();
    expect(document.activeElement).toBe(start);
    expect(document.documentElement.classList.contains('modal-open')).toBe(false);
  });
});
