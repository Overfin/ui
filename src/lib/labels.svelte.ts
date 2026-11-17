// The few words the kit itself shows (Close, Cancel, Save…), in English and
// French; a language added here is picked with setLanguage.
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
    copyByHand: 'Copying failed: the text is selected, copy it yourself.',
    loading: 'Loading…',
    signOut: 'Sign out',
    menu: 'Menu',
    skip: 'Skip to the page',
    edit: 'Edit',
    delete: 'Delete',
    whatIsThis: "What's this?",
    failed: 'Something went wrong.',
    justNow: 'just now',
    minutesAgo: '{n} min ago',
    hoursAgo: '{n} h ago',
    daysAgo: '{n} d ago',
  },
  fr: {
    close: 'Fermer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    confirm: 'Confirmer',
    ok: 'OK',
    sure: 'Êtes-vous sûr ?',
    copy: 'Copier',
    copied: 'Copié.',
    copyByHand: 'La copie a échoué : le texte est sélectionné, copiez-le vous-même.',
    loading: 'Chargement…',
    signOut: 'Se déconnecter',
    menu: 'Menu',
    skip: 'Aller à la page',
    edit: 'Modifier',
    delete: 'Supprimer',
    whatIsThis: 'Qu’est-ce que c’est ?',
    failed: 'Une erreur s’est produite.',
    justNow: 'à l’instant',
    minutesAgo: 'il y a {n} min',
    hoursAgo: 'il y a {n} h',
    daysAgo: 'il y a {n} j',
  },
} satisfies Record<string, Record<string, string>>;

export type Language = keyof typeof words;
export type Word = keyof (typeof words)['en'];

let current = $state<Language>('en');
// The tag given ("fr-CA"), for dates and numbers written its way; none
// until setLanguage is called: the browser's own way then.
let tag = $state<string | undefined>(undefined);

/** setLanguage picks the kit's language ("fr", "fr-CA"…); English when the
 * kit has no words in it. */
export function setLanguage(given: string) {
  const code = given.slice(0, 2).toLowerCase();
  current = code in words ? (code as Language) : 'en';
  tag = given && isLocale(given) ? given : undefined;
}

function isLocale(given: string): boolean {
  try {
    return Intl.DateTimeFormat.supportedLocalesOf([given]).length > 0;
  } catch {
    return false;
  }
}

/** locale is the language tag dates and numbers are written in: the one
 * given to setLanguage, or none (the browser's). */
export function locale(): string | undefined {
  return tag;
}

/** word returns one of the kit's words, in the current language. */
export function word(key: Word, n?: number): string {
  const w = words[current][key];
  return n === undefined ? w : w.replace('{n}', String(n));
}
