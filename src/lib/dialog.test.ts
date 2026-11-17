import { afterEach, describe, expect, it } from 'vitest';
import { ask, dialog, tell } from './dialog.svelte';
import { setLanguage } from './labels.svelte';

afterEach(() => {
  dialog.current = null;
  setLanguage('en');
});

describe('ask and tell', () => {
  it('ask puts a question up, true once confirmed', async () => {
    const answer = ask('Delete Radarr?', { yes: 'Delete', danger: true });
    expect(dialog.current).toMatchObject({ title: 'Are you sure?', message: 'Delete Radarr?', yes: 'Delete', danger: true, notice: false });
    dialog.current!.resolve(true);
    expect(await answer).toBe(true);
  });
  it('ask has the kit’s words by default, in its language', () => {
    setLanguage('fr');
    void ask('Continuer ?');
    expect(dialog.current).toMatchObject({ title: 'Êtes-vous sûr ?', yes: 'Confirmer', danger: false });
  });
  it('tell says something with only OK', async () => {
    const done = tell('Done', 'Nothing new.');
    expect(dialog.current).toMatchObject({ title: 'Done', message: 'Nothing new.', yes: 'OK', notice: true });
    dialog.current!.resolve(true);
    await expect(done).resolves.toBeUndefined();
  });
  it('a question asked over another answers the first with no, never leaves it waiting', async () => {
    const first = ask('First?');
    const second = ask('Second?');
    expect(dialog.current?.message).toBe('Second?');
    expect(await first).toBe(false);
    dialog.current!.resolve(true);
    expect(await second).toBe(true);
  });
});
