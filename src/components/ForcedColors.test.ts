// Windows' high contrast (forced colors): the browser replaces the page's
// colors with the system's few, and backgrounds go. What only a background
// said must still be seen: a switch on or off, the menu's current page, a
// badge's and a toast's dot. Chromium can be told to force colors (CDP);
// Firefox can't from here, so these run in Chromium.
import { afterEach, describe, expect, it } from 'vitest';
import { cdp, server } from 'vitest/browser';
import Shell from './Shell.svelte';
import Badge from './Badge.svelte';
import { html, render, text } from '../test/render';

const chromium = server.browser === 'chromium';
async function forced(on: boolean) {
  await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: on ? 'active' : 'none' }] });
}
afterEach(async () => {
  if (chromium) await forced(false);
});
const transparent = (c: string) => c === 'rgba(0, 0, 0, 0)' || c === 'transparent';

describe.runIf(chromium)('forced colors', () => {
  it('a switch shows its knob, and on differs from off', async () => {
    await forced(true);
    expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    document.body.innerHTML = '<input type="checkbox" id="on" checked /><input type="checkbox" id="off" />';
    const on = document.getElementById('on')!, off = document.getElementById('off')!;
    for (const el of [on, off]) {
      const knob = getComputedStyle(el, '::after').backgroundColor;
      expect(transparent(knob)).toBe(false);
      expect(knob).not.toBe(getComputedStyle(el).backgroundColor);
    }
    expect(getComputedStyle(on).backgroundColor).not.toBe(getComputedStyle(off).backgroundColor);
  });

  it('the menu marks the page shown by more than a background', async () => {
    await forced(true);
    render(Shell, { name: 'P', nav: [{ items: [{ href: '#a', label: 'A' }, { href: '#b', label: 'B' }] }], active: '#a', children: html('<p></p>') });
    const [a, b] = document.querySelectorAll('nav a');
    const look = (el: Element) => { const c = getComputedStyle(el); return `${c.outlineStyle} ${c.borderLeftStyle} ${c.textDecorationLine} ${c.color}`; };
    expect(look(a)).not.toBe(look(b));
  });

  it('a badge keeps its dot', async () => {
    await forced(true);
    render(Badge, { kind: 'err', children: text('No answer') });
    expect(transparent(getComputedStyle(document.querySelector('.badge')!, '::before').backgroundColor)).toBe(false);
  });
});
