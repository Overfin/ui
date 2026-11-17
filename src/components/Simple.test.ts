// The components that only show what they're given.
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import Card from './Card.svelte';
import Empty from './Empty.svelte';
import Field from './Field.svelte';
import Loading from './Loading.svelte';
import Notice from './Notice.svelte';
import PageHead from './PageHead.svelte';
import Progress from './Progress.svelte';
import Single from './Single.svelte';
import Stats from './Stats.svelte';
import Status from './Status.svelte';
import { setLanguage } from '../lib/labels.svelte';
import { html, render, text } from '../test/render';

describe('Card', () => {
  it('has a head with its title, description and badge, then its body and foot', () => {
    render(Card, { title: 'Adding', description: 'How many a day.', badge: text('Dry run'), children: html('<p>Body</p>'), foot: html('<button>Save</button>') });
    expect(document.querySelector('section .card-head h2')!.textContent).toBe('Adding');
    expect(document.querySelector('section .card-head p')!.textContent).toBe('How many a day.');
    expect(document.querySelector('section .card-head > span')!.textContent).toBe('Dry run');
    expect(document.querySelector('section > p')!.textContent).toBe('Body');
    expect(document.querySelector('section .card-foot button')!.textContent).toBe('Save');
  });
  it('has no head nor foot when given none', () => {
    render(Card, { children: html('<p>Only</p>') });
    expect(document.querySelector('.card-head')).toBeNull();
    expect(document.querySelector('.card-foot')).toBeNull();
  });
  it('shows a description given without a title', () => {
    render(Card, { description: 'Said anyway.' });
    expect(document.querySelector('section')!.textContent).toContain('Said anyway.');
  });
});

describe('PageHead', () => {
  it('is the page heading, with its buttons', async () => {
    render(PageHead, { title: 'Services', description: 'Where titles go.', actions: html('<button>Add</button>') });
    await expect.element(page.getByRole('heading', { level: 1, name: 'Services' })).toBeVisible();
    expect(document.querySelector('.page-head .actions button')!.textContent).toBe('Add');
  });
  it('has no description or actions when given none', () => {
    render(PageHead, { title: 'T' });
    expect(document.querySelector('.page-head p')).toBeNull();
    expect(document.querySelector('.page-head .actions')).toBeNull();
  });
  it('wraps a very long title instead of widening the page', () => {
    render(PageHead, { title: 'Supercalifragilisticexpialidocious'.repeat(8) });
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  });
});

describe('Field', () => {
  it('names its control and shows a hint', async () => {
    render(Field, { label: 'Address', hint: 'With https://.', children: html('<input />') });
    await expect.element(page.getByRole('textbox', { name: /Address/ })).toBeVisible();
    expect(document.querySelector('.field .hint')!.textContent).toBe('With https://.');
  });
  it('takes the whole row when wide', () => {
    render(Field, { label: 'A', wide: true, children: html('<input />') });
    expect(document.querySelector('label.field')!.classList.contains('full')).toBe(true);
  });
});

describe('Loading', () => {
  it('is a status, in the kit’s language', async () => {
    render(Loading, {});
    await expect.element(page.getByRole('status')).toHaveTextContent('Loading…');
  });
  it('follows the language and takes its own text', () => {
    setLanguage('fr-CA');
    render(Loading, {});
    render(Loading, { text: 'Searching…' });
    const all = [...document.querySelectorAll('.loading')].map((e) => e.textContent);
    expect(all).toEqual(['Chargement…', 'Searching…']);
  });
});

describe('Empty and Notice', () => {
  it('show what they hold', () => {
    render(Empty, { children: text('No service yet.') });
    render(Notice, { children: text('Dry run is on.') });
    render(Notice, { warn: true, children: text('Careful.') });
    expect(document.querySelector('.empty')!.textContent).toBe('No service yet.');
    const notices = document.querySelectorAll('.notice');
    expect(notices[0].classList.contains('warn')).toBe(false);
    expect(notices[1].classList.contains('warn')).toBe(true);
  });
});

describe('Status', () => {
  it('is an alert only when it says an error', () => {
    render(Status, { text: 'Saved.', kind: 'ok' });
    render(Status, { text: 'It failed.', kind: 'error' });
    render(Status, { text: '', kind: 'error' });
    const s = document.querySelectorAll('.status');
    expect(s[0].getAttribute('role')).toBeNull();
    expect(s[1].getAttribute('role')).toBe('alert');
    expect(s[2].getAttribute('role')).toBeNull();
  });
});

describe('Stats', () => {
  it('shows each number with what it counts', () => {
    render(Stats, { items: [{ value: 12, label: 'waiting' }, { value: '3', label: 'today' }] });
    expect([...document.querySelectorAll('.stat')].map((s) => s.textContent)).toEqual(['12waiting', '3today']);
  });
  it('takes two numbers with the same label', () => {
    render(Stats, { items: [{ value: 1, label: 'files' }, { value: 2, label: 'files' }] });
    expect(document.querySelectorAll('.stat').length).toBe(2);
  });
  it('shows nothing for no items', () => {
    render(Stats, { items: [] });
    expect(document.querySelectorAll('.stat').length).toBe(0);
  });
});

describe('Progress', () => {
  it('is a named progress bar', async () => {
    render(Progress, { value: 40, label: 'Disk used' });
    const bar = page.getByRole('progressbar', { name: 'Disk used' });
    await expect.element(bar).toBeVisible();
    expect((document.querySelector('progress') as HTMLProgressElement).value).toBe(40);
  });
  it('takes a value it can’t show without breaking the page', () => {
    render(Progress, { value: Number.NaN, label: 'Unknown' });
    render(Progress, { value: 150, label: 'Over' });
    render(Progress, { value: -5, label: 'Under' });
    const bars = document.querySelectorAll('progress');
    expect(bars.length).toBe(3);
    expect(bars[0].textContent).not.toContain('NaN');
  });
});

describe('Single', () => {
  it('is the page, with the panel’s name as its heading and the logo unnamed', async () => {
    render(Single, { name: 'Overtide', logo: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', children: html('<section><h2>Sign in</h2></section>') });
    await expect.element(page.getByRole('main')).toBeVisible();
    await expect.element(page.getByRole('heading', { level: 1, name: 'Overtide' })).toBeVisible();
    expect(document.querySelector('main.single img')!.getAttribute('alt')).toBe('');
  });
});
