// Times and numbers as the panels show them.

/** ago says how long ago, roughly: "5 min ago", "3 h ago", "2 d ago". */
export function ago(iso: string | undefined, now = Date.now()): string {
  if (!iso) return '';
  const min = Math.round((now - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  if (min < 48 * 60) return `${Math.round(min / 60)} h ago`;
  return `${Math.round(min / 1440)} d ago`;
}

/** when is a date and time in the browser's way of writing them. */
export function when(iso: string | undefined): string {
  return iso ? new Date(iso).toLocaleString() : '';
}

/** day is a date in the browser's way of writing it. */
export function day(iso: string | undefined): string {
  return iso ? new Date(iso).toLocaleDateString() : '';
}

/** initials are what an avatar shows: the first letters of two words, or
 * an email's first letter. */
export function initials(name: string): string {
  const text = (name || '?').trim() || '?';
  const letters = text.includes('@') ? text[0] : text.split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
  return letters.toUpperCase();
}

/** hue picks one of eight avatar colors from a name, always the same one. */
export function hue(name: string): number {
  let n = 0;
  for (const c of (name || '?').trim()) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  return n % 8;
}
