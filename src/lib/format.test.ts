import { afterEach, describe, expect, it } from 'vitest';
import { setLanguage } from './labels.svelte';
import { ago, day, hue, initials, when } from './format';

describe('ago', () => {
  const now = Date.parse('2026-10-30T12:00:00Z');
  it('rounds to minutes, hours, days', () => {
    expect(ago('2026-10-30T11:59:50Z', now)).toBe('just now');
    expect(ago('2026-10-30T11:55:00Z', now)).toBe('5 min ago');
    expect(ago('2026-10-30T09:00:00Z', now)).toBe('3 h ago');
    expect(ago('2026-10-27T12:00:00Z', now)).toBe('3 d ago');
  });
  it('says nothing without a time', () => {
    expect(ago(undefined, now)).toBe('');
  });
});

describe('initials and hue', () => {
  it('takes two words, or an email first letter', () => {
    expect(initials('jane doe smith')).toBe('JD');
    expect(initials('admin@example.org')).toBe('A');
    expect(initials('  ')).toBe('?');
  });
  it('gives a name always the same of eight colors', () => {
    expect(hue('Radarr')).toBe(hue('Radarr'));
    for (const n of ['a', 'Sonarr', 'admin@example.org']) expect(hue(n)).toBeGreaterThanOrEqual(0), expect(hue(n)).toBeLessThan(8);
  });
});

describe('edge cases', () => {
  const now = Date.parse('2026-10-30T12:00:00Z');
  it('says nothing for a time it can’t read', () => {
    expect(ago('not a date', now)).toBe('');
    expect(when('not a date')).toBe('');
    expect(day('not a date')).toBe('');
    expect(when('')).toBe('');
  });
  it('says just now for a time a little ahead (a clock off by a few seconds)', () => {
    expect(ago('2026-10-30T12:00:20Z', now)).toBe('just now');
  });
  it('writes a readable time as the browser does', () => {
    expect(when('2026-10-30T12:00:00Z')).toBe(new Date('2026-10-30T12:00:00Z').toLocaleString());
    expect(day('2026-10-30T12:00:00Z')).toBe(new Date('2026-10-30T12:00:00Z').toLocaleDateString());
  });
  it('takes whole letters: emoji, accents, right-to-left names', () => {
    expect(initials('😀 smile')).toBe('😀S');
    expect(initials('émile zola')).toBe('ÉZ');
    expect(initials('محمد علي')).toBe('مع');
    expect(initials('  jane   doe ')).toBe('JD');
    expect(initials('')).toBe('?');
  });
  it('gives an empty name a color too', () => {
    expect(hue('')).toBe(hue('?'));
  });
});

describe('in the kit’s language (fr-CA)', () => {
  const now = Date.parse('2026-10-30T12:00:00Z');
  afterEach(() => setLanguage('en'));
  it('says how long ago in French', () => {
    setLanguage('fr-CA');
    expect(ago('2026-10-30T11:59:50Z', now)).toBe('à l’instant');
    expect(ago('2026-10-30T11:55:00Z', now)).toBe('il y a 5 min');
    expect(ago('2026-10-30T09:00:00Z', now)).toBe('il y a 3 h');
    expect(ago('2026-10-27T12:00:00Z', now)).toBe('il y a 3 j');
  });
  it('writes dates the Québec way, whatever the browser’s language', () => {
    setLanguage('fr-CA');
    expect(day('2026-10-30T12:00:00Z')).toBe(new Date('2026-10-30T12:00:00Z').toLocaleDateString('fr-CA'));
    expect(day('2026-10-30T12:00:00Z')).toMatch(/^2026-10-30$|^30\/10\/2026$/);
    expect(when('2026-10-30T12:00:00Z')).toBe(new Date('2026-10-30T12:00:00Z').toLocaleString('fr-CA'));
    setLanguage('en-GB');
    expect(day('2026-10-30T12:00:00Z')).toBe('30/10/2026');
  });
  it('a tag that isn’t a language leaves dates to the browser, and stays English', () => {
    setLanguage('not a tag!');
    expect(day('2026-10-30T12:00:00Z')).toBe(new Date('2026-10-30T12:00:00Z').toLocaleDateString());
    expect(ago('2026-10-30T11:55:00Z', now)).toBe('5 min ago');
  });
});
