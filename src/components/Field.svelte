<!-- A form field: its name, the control, a hint under it. wide: it takes
     the whole row of a .fields grid. -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { label, hint = '', wide = false, children }: { label: string; hint?: string; wide?: boolean; children: Snippet } = $props();
</script>

<label class="field" class:full={wide}>
  <span>{label}</span>
  {@render children()}
  {#if hint}<span class="hint">{hint}</span>{/if}
</label>
