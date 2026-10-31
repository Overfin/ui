<!-- The confirmation on screen, if any (ask and tell, in lib/dialog). Put
     one in the panel's root, next to <Toasts />. -->
<script lang="ts">
  import Modal from './Modal.svelte';
  import { dialog } from '../lib/dialog.svelte';
  import { word } from '../lib/labels.svelte';

  let no = $state<HTMLButtonElement>();
  let yes = $state<HTMLButtonElement>();

  $effect(() => {
    const q = dialog.current;
    if (q) (q.danger ? no : yes)?.focus();
  });

  function answer(value: boolean) {
    const q = dialog.current;
    dialog.current = null;
    q?.resolve(value);
  }
</script>

{#if dialog.current}
  {@const q = dialog.current}
  <Modal title={q.title} size="small" alert close={() => answer(false)}>
    <p class="ask">{q.message}</p>
    {#snippet foot()}
      <span class="grow"></span>
      {#if !q.notice}<button type="button" bind:this={no} onclick={() => answer(false)}>{word('cancel')}</button>{/if}
      <button type="button" bind:this={yes} class={q.danger ? 'danger' : 'primary'} onclick={() => answer(true)}>{q.yes}</button>
    {/snippet}
  </Modal>
{/if}
