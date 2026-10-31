<!-- A form in a window: its fields, then a status line and its buttons.
     save runs when it's sent, with the window busy, and closes it once
     done; a failure is said in the window, which stays open. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Modal from './Modal.svelte';
  import { word } from '../lib/labels.svelte';

  let {
    title,
    description = '',
    wide = false,
    saveLabel = '',
    danger = false,
    save,
    close,
    children,
    more,
  }: {
    title: string;
    description?: string;
    wide?: boolean;
    saveLabel?: string;
    /** danger: saving deletes or stops something. */
    danger?: boolean;
    save: () => Promise<void> | void;
    close: () => void;
    children: Snippet;
    /** more: other buttons, before Cancel. */
    more?: Snippet;
  } = $props();

  const id = `form-${Math.random().toString(36).slice(2)}`;
  let busy = $state(false);
  let failure = $state('');

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    busy = true;
    failure = '';
    try {
      await save();
      busy = false;
      close();
    } catch (err) {
      busy = false;
      failure = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<Modal {title} {description} size={wide ? 'wide' : 'normal'} {busy} {close}>
  <form {id} class="modal-form" onsubmit={submit}>{@render children()}</form>
  {#snippet foot()}
    <span class="status" class:error={failure !== ''} role={failure ? 'alert' : undefined}>{failure}</span>
    {@render more?.()}
    <button type="button" disabled={busy} onclick={close}>{word('cancel')}</button>
    <button type="submit" form={id} class={danger ? 'danger' : 'primary'} disabled={busy}>{saveLabel || word('save')}</button>
  {/snippet}
</Modal>
