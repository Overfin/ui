import { describe, expect, it } from 'vitest';
import { ago, hue, initials } from './format';

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
