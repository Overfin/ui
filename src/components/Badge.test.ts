import { describe, expect, it } from 'vitest';
import Badge from './Badge.svelte';
import { render, text } from '../test/render';

describe('Badge', () => {
  it('shows its words in the color of its kind', () => {
    render(Badge, { kind: 'ok', children: text('Answers') });
    const b = document.querySelector('.badge')!;
    expect(b.classList.contains('ok')).toBe(true);
    expect(b.textContent).toBe('Answers');
  });
  it('is plain without a kind', () => {
    render(Badge, { children: text('Waiting') });
    expect(document.querySelector('.badge')!.className.trim()).toBe('badge');
  });
  it('keeps a long text on one line, and right-to-left text as it is', () => {
    render(Badge, { kind: 'warn', children: text('קבצים חסרים בתיקייה') });
    const b = document.querySelector<HTMLElement>('.badge')!;
    expect(b.textContent).toBe('קבצים חסרים בתיקייה');
    expect(getComputedStyle(b).whiteSpace).toBe('nowrap');
  });
});
