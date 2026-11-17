import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import Shell from './Shell.svelte';
import { setLanguage } from '../lib/labels.svelte';
import type { NavGroup } from '../lib/nav';
import { html, render } from '../test/render';

const nav: NavGroup[] = [
  { items: [{ href: '#home', label: 'Home', icon: ['M3 11l9-7 9 7'] }] },
  { label: 'Library', items: [{ href: '#services', label: 'Services' }, { href: '#settings', label: 'Settings' }] },
];

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
    for (let i = 0; i < 5; i++) {
      await userEvent.tab();
      order.push(document.activeElement?.textContent?.trim() ?? '');
    }
    expect(order).toEqual(['Home', 'Services', 'Settings', 'Sign out', 'In the page']);
  });
});
