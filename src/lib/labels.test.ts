import { afterEach, describe, expect, it } from 'vitest';
import { setLanguage, word } from './labels.svelte';

afterEach(() => setLanguage('en'));

describe('the kit’s words', () => {
  it('are English first', () => {
    expect(word('cancel')).toBe('Cancel');
  });
  it('follow a language tag, whatever its region or case', () => {
    setLanguage('fr-CA');
    expect(word('cancel')).toBe('Annuler');
    setLanguage('FR');
    expect(word('save')).toBe('Enregistrer');
  });
  it('fall back to English for a language the kit doesn’t have, or none', () => {
    setLanguage('fr');
    setLanguage('de-DE');
    expect(word('close')).toBe('Close');
    setLanguage('fr');
    setLanguage('');
    expect(word('close')).toBe('Close');
  });
  it('take no word from an object’s own properties', () => {
    setLanguage('constructor');
    expect(word('close')).toBe('Close');
    setLanguage('__proto__');
    expect(word('close')).toBe('Close');
  });
});
