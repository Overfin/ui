<!-- A page's title and what it's for, with its buttons on the right. -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, description = '', actions }: { title: string; description?: string; actions?: Snippet } = $props();
</script>

<div class="page-head">
  <div>
    <h1>{title}</h1>
    {#if description}<p>{description}</p>{/if}
  </div>
  {#if actions}<div class="actions">{@render actions()}</div>{/if}
</div>
