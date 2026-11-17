// The focus is seen on everything the keyboard reaches, in both themes: a
// ring of the accent around buttons, links, tabs and switches (a primary
// button's border is already the accent, a tab and the close button have
// none, so a border alone isn't enough).
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import Modal from './Modal.svelte';
import Shell from './Shell.svelte';
import { html, render } from '../test/render';

async function ringOf(selector: string): Promise<string> {
  const start = document.createElement('button');
  start.className = 'start';
  document.body.prepend(start);
  start.focus();
  for (let i = 0; i < 30 && !document.activeElement?.matches(selector); i++) await userEvent.tab();
  const el = document.activeElement!;
  expect(el.matches(selector)).toBe(true);
  const cs = getComputedStyle(el);
  return `${cs.outlineStyle} ${cs.outlineWidth}`;
}

describe('the focus, seen', () => {
  for (const theme of ['dark', 'light']) {
    describe(theme, () => {
      const page = (markup: string) => {
        document.documentElement.dataset.theme = theme;
        render(Shell, { name: 'P', nav: [{ items: [{ href: '#a', label: 'A' }] }], active: '#a', children: html(`<div>${markup}</div>`) });
      };
      it('on a primary button', async () => {
        page('<button class="primary">Save</button>');
        expect(await ringOf('button.primary')).toBe('solid 2px');
      });
      it('on a plain, a danger and a ghost button', async () => {
        page('<button class="x">A</button><button class="danger">B</button><button class="ghost">C</button>');
        expect(await ringOf('button.x')).toBe('solid 2px');
        expect(await ringOf('button.danger')).toBe('solid 2px');
        expect(await ringOf('button.ghost')).toBe('solid 2px');
      });
      it('on a menu link and a link', async () => {
        page('<a href="#b" class="l">B</a>');
        expect(await ringOf('nav a')).toBe('solid 2px');
        expect(await ringOf('a.l')).toBe('solid 2px');
      });
      it('on a switch, on or off', async () => {
        page('<input type="checkbox" class="on" checked /><input type="checkbox" class="off" />');
        expect(await ringOf('input.on')).toBe('solid 2px');
        expect(await ringOf('input.off')).toBe('solid 2px');
      });
      it('on a window’s close button', async () => {
        document.documentElement.dataset.theme = theme;
        render(Modal, { title: 'W', close: () => {}, children: html('<p>x</p>') });
        expect(await ringOf('dialog .close')).toBe('solid 2px');
      });
    });
  }
});
