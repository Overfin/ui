<!-- A short state, in color: ok, warn, err, info, or plain (no dot). -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { kind = '', children }: { kind?: '' | 'ok' | 'warn' | 'err' | 'info' | 'plain'; children: Snippet } = $props();
</script>

<span class="badge {kind}">{@render children()}</span>
