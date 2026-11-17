import { describe, expect, it } from 'vitest';
import Avatar from './Avatar.svelte';
import { render } from '../test/render';

describe('Avatar', () => {
  it('shows initials on one of eight colors, hidden from screen readers (the name is beside it)', () => {
    render(Avatar, { name: 'Jane Doe' });
    const a = document.querySelector('.avatar')!;
    expect(a.textContent).toBe('JD');
    expect(a.getAttribute('aria-hidden')).toBe('true');
    expect(a.className).toMatch(/\bc[0-7]\b/);
    expect(a.classList.contains('big')).toBe(false);
  });
  it('can be big', () => {
    render(Avatar, { name: 'x', big: true });
    expect(document.querySelector('.avatar')!.classList.contains('big')).toBe(true);
  });
  it('shows a whole letter for names that start with an emoji or an accent', () => {
    render(Avatar, { name: '😀 Smile' });
    expect(document.querySelector('.avatar')!.textContent).toBe('😀S');
  });
  it('shows a question mark for an empty name', () => {
    render(Avatar, { name: '' });
    expect(document.querySelector('.avatar')!.textContent).toBe('?');
  });
});
