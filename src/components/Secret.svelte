<!-- A value shown once, to copy: a key, a link. It's selected when shown. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { word } from '../lib/labels.svelte';
  import { toast } from '../lib/toast.svelte';

  let { value, children, after = '' }: { value: string; children: Snippet; after?: string } = $props();

  let input = $state<HTMLInputElement>();
  $effect(() => input?.select());

  function copy() {
    navigator.clipboard?.writeText(value).then(() => toast(word('copied')), () => input?.select());
  }
</script>

<div class="notice secret">
  <div>{@render children()}</div>
  <div class="row">
    <input bind:this={input} {value} readonly class="mono" onfocus={() => input?.select()} />
    <button type="button" onclick={copy}>{word('copy')}</button>
  </div>
  {#if after}<div class="hint">{after}</div>{/if}
</div>
