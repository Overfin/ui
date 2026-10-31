// The few words the kit itself shows (Close, Cancel, Save…). The panels are
// in English today; a language added here is picked with setLanguage.
const words = {
  en: {
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    confirm: 'Confirm',
    ok: 'OK',
    sure: 'Are you sure?',
    copy: 'Copy',
    copied: 'Copied.',
    loading: 'Loading…',
    signOut: 'Sign out',
    menu: 'Menu',
    edit: 'Edit',
    delete: 'Delete',
  },
} satisfies Record<string, Record<string, string>>;

export type Language = keyof typeof words;
export type Word = keyof (typeof words)['en'];

let current = $state<Language>('en');

/** setLanguage picks the kit's language ("fr", "fr-CA"…); English when the
 * kit has no words in it. */
export function setLanguage(tag: string) {
  const code = tag.slice(0, 2).toLowerCase();
  current = code in words ? (code as Language) : 'en';
}

/** word returns one of the kit's words, in the current language. */
export function word(key: Word): string {
  return words[current][key];
}
