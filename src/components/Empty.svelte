<!-- What a list says when it has nothing to show. -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<div class="empty">{@render children()}</div>
