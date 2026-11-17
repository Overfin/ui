<!-- A value shown once, to copy: a key, a link. It's selected when shown. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { word } from '../lib/labels.svelte';
  import { toast } from '../lib/toast.svelte';

  let { value, children, after = '' }: { value: string; children: Snippet; after?: string } = $props();

  // The text above names the field.
  const id = $props.id();
  let input = $state<HTMLInputElement>();
  let button = $state<HTMLButtonElement>();
  $effect(() => input?.select());

  // Over plain HTTP (a panel on the local network) the browser has no
  // clipboard API: the field is copied the old way, focused and selected
  // (a browser copies the selection of the field with the focus), then the
  // focus goes back to Copy. If even that fails, the field stays selected,
  // to be copied by hand, and the toast says so.
  async function copy() {
    try {
      if (!navigator.clipboard) throw new Error('no clipboard API');
      await navigator.clipboard.writeText(value);
    } catch {
      input?.focus();
      input?.select();
      let done = false;
      try {
        done = document.execCommand('copy');
      } catch {
        done = false;
      }
      if (!done) {
        toast(word('copyByHand'), true);
        return;
      }
      button?.focus();
    }
    toast(word('copied'));
  }
</script>

<div class="notice secret">
  <div id={`${id}-label`}>{@render children()}</div>
  <div class="row">
    <input bind:this={input} {value} readonly class="mono" aria-labelledby={`${id}-label`} onfocus={() => input?.select()} />
    <button type="button" bind:this={button} onclick={copy}>{word('copy')}</button>
  </div>
  {#if after}<div class="hint">{after}</div>{/if}
</div>
