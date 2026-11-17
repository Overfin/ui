import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import Setting from './Setting.svelte';
import RowActions from './RowActions.svelte';
import { setLanguage } from '../lib/labels.svelte';
import { createRawSnippet } from 'svelte';
import { render } from '../test/render';

// A control given the ids, as a panel writes it.
const control = createRawSnippet((ids: () => { label: string; hint: string | undefined }) => ({
  render: () => `<input type="checkbox" aria-labelledby="${ids().label}"${ids().hint ? ` aria-describedby="${ids().hint}"` : ''} />`,
}));

describe('Setting', () => {
  it('names its control by its label, and describes it by its hint', async () => {
    render(Setting, { label: 'Adding', hint: 'Off: Overtide only watches.', children: control });
    const box = page.getByRole('checkbox', { name: 'Adding' });
    await expect.element(box).toBeVisible();
    await expect.element(box).toHaveAccessibleDescription('Off: Overtide only watches.');
  });

  it('gives no hint id without a hint', () => {
    render(Setting, { label: 'Adding', children: control });
    expect(document.querySelector('input')!.hasAttribute('aria-describedby')).toBe(false);
    expect(document.querySelector('.setting .hint')).toBeNull();
  });

  it('each one has ids of its own', () => {
    render(Setting, { label: 'A', hint: 'a', children: control });
    render(Setting, { label: 'B', hint: 'b', children: control });
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is marked when it depends on the one above, has no effect now, or goes under its text', () => {
    render(Setting, { label: 'A', sub: true, off: true, stack: true, children: control });
    const row = document.querySelector('.setting')!;
    expect(['sub', 'off', 'stack'].every((c) => row.classList.contains(c))).toBe(true);
  });

  it('keeps a long label inside the row', () => {
    render(Setting, { label: 'Supercalifragilistic'.repeat(10), children: control });
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  });
});

describe('RowActions', () => {
  function row() {
    const table = document.createElement('table');
    table.innerHTML = '<tbody><tr><td>Radarr</td></tr></tbody>';
    document.body.append(table);
    return table.querySelector('tr')!;
  }

  it('has Edit and Delete, each named with the row’s name', async () => {
    let edited = 0, removed = 0;
    render(RowActions, { name: 'Radarr', edit: () => edited++, remove: () => removed++ }, row());
    await page.getByRole('button', { name: 'Edit Radarr' }).click();
    await page.getByRole('button', { name: 'Delete Radarr' }).click();
    expect([edited, removed]).toEqual([1, 1]);
    expect(document.querySelector('td.row-actions button.danger')!.textContent).toBe('Delete');
  });

  it('shows only the buttons it’s given, after its own, in the kit’s language', () => {
    setLanguage('fr');
    const other = createRawSnippet(() => ({ render: () => '<button type="button" class="small">Test</button>' }));
    render(RowActions, { edit: () => {}, children: other }, row());
    expect([...document.querySelectorAll('td.row-actions button')].map((b) => b.textContent)).toEqual(['Test', 'Modifier']);
    expect(document.querySelector('td.row-actions button:last-child')!.hasAttribute('aria-label')).toBe(false);
  });
});
