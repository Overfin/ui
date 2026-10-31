<!-- A list row's buttons: Edit, Delete, and any other before them. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { word } from '../lib/labels.svelte';

  let { edit, remove, name = '', children }: { edit?: () => void; remove?: () => void; name?: string; children?: Snippet } = $props();
</script>

<td class="row-actions">
  {@render children?.()}
  {#if edit}<button type="button" class="small" aria-label={name ? `${word('edit')} ${name}` : undefined} onclick={edit}>{word('edit')}</button>{/if}
  {#if remove}<button type="button" class="small danger" aria-label={name ? `${word('delete')} ${name}` : undefined} onclick={remove}>{word('delete')}</button>{/if}
</td>
