// A page right to left (dir="rtl" on <html>): the kit's sides follow the
// line, so everything mirrors, and nothing is cut or out of the screen.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Toasts from './Toasts.svelte';
import RowActions from './RowActions.svelte';
import Shell from './Shell.svelte';
import { toast } from '../lib/toast.svelte';
import { frame, html, render } from '../test/render';

beforeEach(() => (document.documentElement.dir = 'rtl'));
afterEach(() => document.documentElement.removeAttribute('dir'));

const box = (el: Element) => el.getBoundingClientRect();
const knob = (input: HTMLInputElement) => {
  // Where the knob is drawn: the pseudo-element's offset from the switch's start.
  return parseFloat(getComputedStyle(input, '::after').insetInlineStart);
};

describe('right to left', () => {
  it('a switch turned on has its knob at the line’s end: the left', async () => {
    document.body.innerHTML = '<input type="checkbox" id="on" checked /><input type="checkbox" id="off" />';
    const on = document.getElementById('on') as HTMLInputElement;
    const off = document.getElementById('off') as HTMLInputElement;
    await new Promise((r) => setTimeout(r, 250));
    expect(knob(off)).toBe(2);
    expect(knob(on)).toBeGreaterThan(10);
    // Physically: the "start" of an rtl line is its right side, so the
    // knob's right edge, measured from the switch's right edge, is far.
    const css = getComputedStyle(on, '::after');
    expect(css.right).not.toBe('auto');
    expect(parseFloat(css.right)).toBeGreaterThan(10);
  });

  it('messages sit in the bottom left corner, inside the screen', async () => {
    render(Toasts, {});
    toast('הקובץ נשמר.');
    await frame();
    const r = box(document.querySelector('.toast')!);
    expect(r.left).toBeGreaterThanOrEqual(0);
    expect(r.left).toBeLessThan(window.innerWidth / 2);
  });

  it('a table’s headers and its row buttons go to the line’s sides', () => {
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>שם</th><th></th></tr></thead><tbody><tr><td>Radarr</td></tr></tbody>';
    document.body.append(table);
    render(RowActions, { name: 'Radarr', edit: () => {} }, table.querySelector('tbody tr')!);
    expect(getComputedStyle(table.querySelector('th')!).textAlign).toBe('start');
    const cell = table.querySelector('td.row-actions')!;
    const button = cell.querySelector('button')!;
    // The row's end, right to left, is its left side.
    expect(box(button).left - box(cell).left).toBeLessThan(box(cell).right - box(button).right);
  });

  it('the sidebar is on the right, its edge on the page’s side', () => {
    render(Shell, { name: 'P', nav: [{ items: [{ href: '#a', label: 'א' }] }], children: html('<p>x</p>') });
    const side = document.querySelector('.sidebar')!;
    expect(box(side).right).toBeGreaterThan(window.innerWidth - 400);
    const cs = getComputedStyle(side);
    expect(cs.borderLeftWidth).toBe('1px');
    expect(cs.borderRightWidth).toBe('0px');
  });
});
