// Long tables as panels have them (Overtide's torrents, a library's
// titles): thousands of rows, long names and paths, on a phone too.
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import RowActions from './RowActions.svelte';
import Badge from './Badge.svelte';
import { render, text } from '../test/render';

afterEach(() => page.viewport(1536, 864));

function table(rows: number, path = (i: number) => `/mnt/media/films/Title ${i} (2026)/Title.${i}.2160p.mkv`) {
  const wrap = document.createElement('div');
  wrap.className = 'table-wrap';
  wrap.innerHTML = `<table><thead><tr><th>Name</th><th class="hide-narrow">Path</th><th>State</th><th><span class="visually-hidden">Actions</span></th></tr></thead><tbody>${Array.from({ length: rows }, (_, i) => `<tr><td class="name">Title ${i}</td><td class="mono hide-narrow">${path(i)}</td><td class="state"></td></tr>`).join('')}</tbody></table>`;
  document.body.append(wrap);
  const trs = wrap.querySelectorAll('tbody tr');
  trs.forEach((tr, i) => {
    render(Badge, { kind: i % 3 ? 'ok' : 'warn', children: text(i % 3 ? 'Seeding' : 'Stalled') }, tr.querySelector('.state')!);
    render(RowActions, { name: `Title ${i}`, edit: () => {}, remove: () => {} }, tr);
  });
  return wrap;
}

describe('a long table', () => {
  it('2000 rows render in reasonable time, each row’s buttons named after it', () => {
    const t0 = performance.now();
    const wrap = table(2000);
    const took = performance.now() - t0;
    expect(wrap.querySelectorAll('tbody tr').length).toBe(2000);
    expect(took).toBeLessThan(10000);
    expect(wrap.querySelector('tbody tr:last-child button')!.getAttribute('aria-label')).toBe('Edit Title 1999');
  });

  it('never widens the page: the frame scrolls sideways instead, on a desk and a phone', async () => {
    table(50, (i) => '/mnt/' + 'a-very-long-folder-name-without-spaces'.repeat(4) + `/${i}.mkv`);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
    await page.viewport(390, 844);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
  });

  it('a long path breaks inside its cell rather than push the buttons out', () => {
    const wrap = table(3, () => '/mnt/' + 'x'.repeat(400));
    expect(wrap.scrollWidth).toBeLessThanOrEqual(wrap.clientWidth + 1);
  });

  it('Tab goes row by row through the buttons, Edit then Delete', async () => {
    const wrap = table(3);
    (wrap.querySelector('button') as HTMLButtonElement).focus();
    const order = [];
    for (let i = 0; i < 4; i++) {
      order.push(document.activeElement!.getAttribute('aria-label'));
      await userEvent.tab();
    }
    expect(order).toEqual(['Edit Title 0', 'Delete Title 0', 'Edit Title 1', 'Delete Title 1']);
  });
});
