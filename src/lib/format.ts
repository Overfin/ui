// Times and numbers as the panels show them, in the kit's language.
import { locale, word } from './labels.svelte';

/** ago says how long ago, roughly: "5 min ago", "3 h ago", "2 d ago". */
export function ago(iso: string | undefined, now = Date.now()): string {
  const t = iso ? new Date(iso).getTime() : Number.NaN;
  if (!Number.isFinite(t)) return '';
  const min = Math.round((now - t) / 60000);
  if (min < 1) return word('justNow');
  if (min < 60) return word('minutesAgo', min);
  if (min < 48 * 60) return word('hoursAgo', Math.round(min / 60));
  return word('daysAgo', Math.round(min / 1440));
}

/** when is a date and time in the browser's way of writing them. */
export function when(iso: string | undefined): string {
  return readable(iso) ? new Date(iso!).toLocaleString(locale()) : '';
}

/** day is a date in the browser's way of writing it. */
export function day(iso: string | undefined): string {
  return readable(iso) ? new Date(iso!).toLocaleDateString(locale()) : '';
}

// A time a page can show: given, and one the browser can read (else it
// would show "Invalid Date").
function readable(iso: string | undefined): boolean {
  return !!iso && Number.isFinite(new Date(iso).getTime());
}

/** initials are what an avatar shows: the first letters of two words, or
 * an email's first letter. */
export function initials(name: string): string {
  const text = (name || '?').trim() || '?';
  const letters = text.includes('@') ? first(text) : text.split(/\s+/).slice(0, 2).map(first).join('');
  return letters.toUpperCase();
}

// A word's first letter as it's seen: a whole emoji or accented letter, not
// half of one (a string's [0] is a UTF-16 unit).
const graphemes = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter() : null;
function first(word: string): string {
  if (graphemes) for (const g of graphemes.segment(word)) return g.segment;
  return Array.from(word)[0] ?? '';
}

/** hue picks one of eight avatar colors from a name, always the same one. */
export function hue(name: string): number {
  let n = 0;
  for (const c of (name || '?').trim()) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  return n % 8;
}
