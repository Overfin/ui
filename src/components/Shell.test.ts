import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import Shell from './Shell.svelte';
import { setLanguage } from '../lib/labels.svelte';
import type { NavGroup } from '../lib/nav';
import { html, render } from '../test/render';

const nav: NavGroup[] = [
  { items: [{ href: '#home', label: 'Home', icon: ['M3 11l9-7 9 7'] }] },
  { label: 'Library', items: [{ href: '#services', label: 'Services' }, { href: '#settings', label: 'Settings' }] },
];

afterEach(() => page.viewport(1536, 864));

describe('Shell', () => {
  it('has the sidebar named after the panel, its menu, and the page as main', async () => {
    render(Shell, { name: 'Overtide', subtitle: 'Storage', logo: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', nav, active: '#services', children: html('<h1>Services</h1>') });
    await expect.element(page.getByRole('complementary', { name: 'Overtide' })).toBeVisible();
    await expect.element(page.getByRole('navigation', { name: 'Menu' })).toBeVisible();
    await expect.element(page.getByRole('main')).toHaveTextContent('Services');
    expect(document.querySelector('.brand img')!.getAttribute('alt')).toBe('');
    expect(document.querySelector('.brand small')!.textContent).toBe('Storage');
    expect(document.querySelector('nav .group')!.textContent).toBe('Library');
    expect(document.querySelector('nav a svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('marks the page shown as the current one', async () => {
    render(Shell, { name: 'P', nav, active: '#services', children: html('<p></p>') });
    const link = page.getByRole('link', { name: 'Services' });
    await expect.element(link).toHaveAttribute('aria-current', 'page');
    await expect.element(link).toHaveClass('active');
    expect(document.querySelectorAll('[aria-current]').length).toBe(1);
  });

  it('shows who is signed in and a Sign out button, in the kit’s language', async () => {
    setLanguage('fr');
    const signOut = vi.fn();
    render(Shell, { name: 'P', who: 'admin@example.org', signOut, children: html('<p></p>') });
    expect(document.querySelector('.who-name')!.textContent).toBe('admin@example.org');
    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('has no menu, nor who, when given none', () => {
    render(Shell, { name: 'P', children: html('<p></p>') });
    expect(document.querySelector('nav')).toBeNull();
    expect(document.querySelector('.me')).toBeNull();
  });

  it('shows its extra part, and takes the whole width when wide', () => {
    render(Shell, { name: 'P', wide: true, extra: html('<a href="#ops">2 operations</a>'), children: html('<p></p>') });
    expect(document.querySelector('.sidebar-extra a')!.textContent).toBe('2 operations');
    expect(document.querySelector('main')!.classList.contains('wide')).toBe(true);
  });

  it('takes two menu entries to the same page', () => {
    render(Shell, { name: 'P', nav: [{ items: [{ href: '#a', label: 'A' }, { href: '#a', label: 'Also A' }] }], children: html('<p></p>') });
    expect(document.querySelectorAll('nav a').length).toBe(2);
  });

  it('is walked by Tab: the menu, then Sign out, then the page', async () => {
    render(Shell, { name: 'P', nav, active: '#home', signOut: () => {}, children: html('<button id="in-page">In the page</button>') });
    document.body.tabIndex = -1;
    document.body.focus();
    const order: string[] = [];
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      order.push(document.activeElement?.textContent?.trim() ?? '');
    }
    expect(order).toEqual(['Skip to the page', 'Home', 'Services', 'Settings', 'Sign out', 'In the page']);
  });

  it('skips the menu to the page, the address unchanged', async () => {
    render(Shell, { name: 'P', nav, active: '#home', children: html('<button id="in-page">In the page</button>') });
    const before = location.href;
    document.body.tabIndex = -1;
    document.body.focus();
    await userEvent.tab();
    const skip = document.activeElement as HTMLElement;
    expect(skip.textContent).toBe('Skip to the page');
    expect(skip.getBoundingClientRect().top).toBeGreaterThanOrEqual(0); // seen once it has the focus
    await userEvent.keyboard('{Enter}');
    expect(document.activeElement).toBe(document.querySelector('main'));
    expect(location.href).toBe(before);
    await userEvent.tab();
    expect(document.activeElement?.id).toBe('in-page');
  });

  it('has no menu button on a wide screen', () => {
    render(Shell, { name: 'P', nav, active: '#home', children: html('<p></p>') });
    expect(getComputedStyle(document.querySelector('.menu-toggle')!).display).toBe('none');
    expect(getComputedStyle(document.querySelector('nav')!).display).not.toBe('none');
  });

  it('on a phone, opens the menu from its button, whole, and closes it', async () => {
    await page.viewport(390, 844);
    render(Shell, { name: 'P', nav, active: '#home', signOut: () => {}, children: html('<p></p>') });
    const toggle = page.getByRole('button', { name: 'Menu' });
    const menu = document.querySelector('nav')!;
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(getComputedStyle(menu).display).toBe('none');
    await toggle.click();
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
    // Every entry within the screen, none cut, and the groups named.
    for (const a of menu.querySelectorAll('a')) {
      const box = a.getBoundingClientRect();
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(390);
    }
    expect(getComputedStyle(menu.querySelector('.group')!).display).not.toBe('none');
    // Escape closes it, the focus back on its button.
    (menu.querySelector('a') as HTMLElement).focus();
    await userEvent.keyboard('{Escape}');
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(toggle.element());
    // A page picked closes it.
    await toggle.click();
    await page.getByRole('link', { name: 'Services' }).click();
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
