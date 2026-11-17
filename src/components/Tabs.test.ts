import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import TabsHarness from '../test/TabsHarness.svelte';
import { render } from '../test/render';

const three = [{ id: 'disks', label: 'Disks' }, { id: 'queue', label: 'Queue' }, { id: 'done', label: 'Done' }];
const shown = () => document.querySelector('.shown')!.textContent;
const bound = () => document.querySelector('.bound')!.textContent;

describe('Tabs', () => {
  it('is a named tab list, the chosen tab selected and controlling the part shown', async () => {
    render(TabsHarness, { tabs: three, current: 'queue' });
    await expect.element(page.getByRole('tablist', { name: 'Storage' })).toBeVisible();
    const tab = page.getByRole('tab', { name: 'Queue' });
    await expect.element(tab).toHaveAttribute('aria-selected', 'true');
    await expect.element(page.getByRole('tabpanel', { name: 'Queue' })).toBeVisible();
    expect(shown()).toBe('Part queue');
    // Only the chosen tab is in the Tab order.
    expect([...document.querySelectorAll('[role=tab]')].map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
  });

  it('chooses a tab by a click', async () => {
    render(TabsHarness, { tabs: three, current: 'disks' });
    await page.getByRole('tab', { name: 'Done' }).click();
    expect(shown()).toBe('Part done');
    expect(bound()).toBe('done');
  });

  it('moves with the arrows, around the ends, and Home and End, the focus following', async () => {
    render(TabsHarness, { tabs: three, current: 'disks' });
    document.querySelector<HTMLElement>('[role=tab]')!.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(bound()).toBe('queue');
    expect(document.activeElement?.textContent).toBe('Queue');
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(bound()).toBe('disks');
    await userEvent.keyboard('{ArrowLeft}');
    expect(bound()).toBe('done');
    expect(document.activeElement?.textContent).toBe('Done');
    await userEvent.keyboard('{Home}');
    expect(bound()).toBe('disks');
    await userEvent.keyboard('{End}');
    expect(bound()).toBe('done');
    expect(document.activeElement?.textContent).toBe('Done');
  });

  it('goes on with Tab into the part shown', async () => {
    render(TabsHarness, { tabs: three, current: 'disks' });
    document.querySelector<HTMLElement>('[role=tab]')!.focus();
    await userEvent.tab();
    expect(document.activeElement?.className).toBe('inside');
  });

  it('follows the arrows the other way round on a right-to-left page', async () => {
    document.documentElement.dir = 'rtl';
    render(TabsHarness, { tabs: three, current: 'disks' });
    document.querySelector<HTMLElement>('[role=tab]')!.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(bound()).toBe('queue');
  });

  it('takes ids with spaces, dots or slashes', async () => {
    render(TabsHarness, { tabs: [{ id: 'tv shows', label: 'TV' }, { id: 'radarr/4k.v2', label: '4K' }], current: 'tv shows' });
    document.querySelector<HTMLElement>('[role=tab]')!.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(bound()).toBe('radarr/4k.v2');
    expect(document.activeElement?.textContent).toBe('4K');
    await expect.element(page.getByRole('tabpanel', { name: '4K' })).toBeVisible();
  });

  it('is reached by Tab even when the part chosen isn’t one of the tabs', async () => {
    render(TabsHarness, { tabs: three, current: 'gone' });
    expect([...document.querySelectorAll('[role=tab]')].filter((t) => t.getAttribute('tabindex') === '0').length).toBe(1);
  });

  it('takes no tabs, and keys then do nothing', async () => {
    render(TabsHarness, { tabs: [], current: '' });
    const list = document.querySelector<HTMLElement>('[role=tablist]')!;
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(bound()).toBe('');
  });
});

describe('Tabs in the Tab order', () => {
  it('Tab from before them lands on the chosen tab, the list itself no stop of its own', async () => {
    const before = document.createElement('button');
    before.textContent = 'Before';
    document.body.append(before);
    render(TabsHarness, { tabs: three, current: 'queue' });
    before.focus();
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('Queue');
  });
});
