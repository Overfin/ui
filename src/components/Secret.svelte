<!-- A value shown once, to copy: a key, a link. It's selected when shown. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { word } from '../lib/labels.svelte';
  import { toast } from '../lib/toast.svelte';

  let { value, children, after = '' }: { value: string; children: Snippet; after?: string } = $props();

  // The text above names the field.
  const id = $props.id();
  let input = $state<HTMLInputElement>();
  $effect(() => input?.select());

  // Over plain HTTP (a panel on the local network) the browser has no
  // clipboard API: the selected field is copied the old way.
  async function copy() {
    try {
      if (!navigator.clipboard) throw new Error('no clipboard API');
      await navigator.clipboard.writeText(value);
    } catch {
      input?.select();
      if (!document.execCommand('copy')) return;
    }
    toast(word('copied'));
  }
</script>

<div class="notice secret">
  <div id={`${id}-label`}>{@render children()}</div>
  <div class="row">
    <input bind:this={input} {value} readonly class="mono" aria-labelledby={`${id}-label`} onfocus={() => input?.select()} />
    <button type="button" onclick={copy}>{word('copy')}</button>
  </div>
  {#if after}<div class="hint">{after}</div>{/if}
</div>
