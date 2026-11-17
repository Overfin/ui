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
    edit: 'Edit',
    delete: 'Delete',
    whatIsThis: "What's this?",
    failed: 'Something went wrong.',
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
    edit: 'Modifier',
    delete: 'Supprimer',
    whatIsThis: 'Qu’est-ce que c’est ?',
    failed: 'Une erreur s’est produite.',
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
