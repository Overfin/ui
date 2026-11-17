import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { said, toast, toasts } from './toast.svelte';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  toasts.splice(0);
  said.text = '';
});

describe('toast', () => {
  it('shows a message for 3.5 seconds, an error for 7', () => {
    toast('Saved.');
    toast('It failed.', true);
    expect(toasts.map((t) => [t.text, t.error])).toEqual([['Saved.', false], ['It failed.', true]]);
    vi.advanceTimersByTime(3500);
    expect(toasts.map((t) => t.text)).toEqual(['It failed.']);
    vi.advanceTimersByTime(3500);
    expect(toasts).toEqual([]);
  });
  it('has screen readers told the newest message, and the same one twice in a row too', () => {
    toast('Saved.');
    expect(said.text).toBe('Saved.');
    toast('Saved.');
    expect(said.text).not.toBe('Saved.');
    expect(said.text.replace(/​/g, '')).toBe('Saved.');
    toast('Deleted.');
    expect(said.text).toBe('Deleted.');
    vi.advanceTimersByTime(10000);
    expect(said.text).toBe('Deleted.');
  });
  it('removes the right one when an older one goes first', () => {
    toast('a', true);
    toast('b');
    vi.advanceTimersByTime(3500);
    expect(toasts.map((t) => t.text)).toEqual(['a']);
  });
});
