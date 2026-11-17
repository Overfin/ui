// The theme's colors read well: every pair of text and ground the kit
// draws reaches WCAG's 4.5:1 (3:1 for large text and the parts of a
// control), in the dark theme, the light one chosen, and the light one
// followed from the device. Translucent grounds (badges, notices) are laid
// on what they sit on first.
import { afterEach, describe, expect, it } from 'vitest';
import './theme.css';
import css from './theme.css?raw';

type RGBA = [number, number, number, number];

function parse(css: string): RGBA {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p[3] ?? 1];
  }
  const h = css.trim().replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
}

function over(top: RGBA, under: RGBA): RGBA {
  const a = top[3];
  return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)).concat(1) as RGBA;
}

function luminance([r, g, b]: RGBA): number {
  const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function ratio(fg: RGBA, bg: RGBA): number {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

const token = (name: string) => parse(getComputedStyle(document.documentElement).getPropertyValue(`--${name}`));
// A ground: tokens laid one on the other, the last at the bottom.
const ground = (...names: string[]) => names.map(token).reduceRight((under, top) => over(top, under));

// [what, text, ground layers, minimum]
const pairs: [string, string, string[], number][] = [
  ['text on the page', 'text', ['bg'], 4.5],
  ['text on a card', 'text', ['panel'], 4.5],
  ['text in a toast', 'text', ['panel-3'], 4.5],
  ['secondary text on a card', 'muted', ['panel'], 4.5],
  ['secondary text in a card foot', 'muted', ['panel-2'], 4.5],
  ['secondary text on the page', 'muted', ['bg'], 4.5],
  ['a plain badge', 'muted', ['panel-3', 'panel'], 4.5],
  ['a placeholder in a field', 'faint', ['bg'], 4.5],
  ['a placeholder in a read-only field', 'faint', ['panel-2'], 4.5],
  ['a link on a card', 'accent', ['panel'], 4.5],
  ['a link on the page', 'accent', ['bg'], 4.5],
  ['a primary button', 'on-accent', ['accent'], 4.5],
  ['a danger button, an error on a card', 'danger', ['panel'], 4.5],
  ['an error in a card foot', 'danger', ['panel-2'], 4.5],
  ['saved, in a card foot', 'ok', ['panel-2'], 4.5],
  ['an ok badge', 'ok', ['ok-soft', 'panel'], 4.5],
  ['a warn badge', 'warn', ['warn-soft', 'panel'], 4.5],
  ['an error badge', 'danger', ['danger-soft', 'panel'], 4.5],
  ['an info badge', 'accent', ['accent-soft', 'panel'], 4.5],
  ['text in a notice', 'text', ['accent-soft', 'bg'], 4.5],
  ['text in a warn notice', 'text', ['warn-soft', 'bg'], 4.5],
  ['the focus ring on a card', 'accent', ['panel'], 3],
  ['the focus ring on the page', 'accent', ['bg'], 3],
  ['a switch turned on', 'accent', ['panel'], 3],
];

afterEach(() => document.documentElement.removeAttribute('data-theme'));

for (const theme of ['dark', 'light'] as const) {
  describe(`the ${theme} theme`, () => {
    for (const [what, fg, bg, min] of pairs) {
      it(`${what}: ${min}:1 at least`, () => {
        document.documentElement.dataset.theme = theme;
        const r = ratio(token(fg), ground(...bg));
        expect(r, `--${fg} on ${bg.map((b) => `--${b}`).join(' over ')}: ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(min);
      });
    }
  });
}

describe('the light theme followed from the device', () => {
  it('has the very same values as the light theme chosen', () => {
    // Two copies in theme.css: a value changed in one only would give a
    // device in light another color than a page set to light.
    const block = (start: string) => {
      const at = css.indexOf(start);
      const body = css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at));
      return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
    };
    const chosen = block(':root[data-theme="light"]');
    const followed = block(':root:not([data-theme])');
    expect(Object.keys(chosen).length).toBeGreaterThan(20);
    expect(followed).toEqual(chosen);
  });
});
