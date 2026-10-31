<!-- A note on a page: something to know, or to watch (warn). -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { warn = false, children }: { warn?: boolean; children: Snippet } = $props();
</script>

<div class="notice" class:warn>{@render children()}</div>
