<!-- A setting, one per row: what it is on the left, its control on the
     right. The control gets the ids of the label and the hint, for screen
     readers: {#snippet children(ids)}<input aria-labelledby={ids.label}
     aria-describedby={ids.hint} />{/snippet}. sub: it depends on the row
     above; off: it has no effect now. -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    label,
    hint = '',
    sub = false,
    off = false,
    stack = false,
    children,
  }: {
    label: string;
    hint?: string;
    sub?: boolean;
    off?: boolean;
    /** stack: the control goes under the text (long lists). */
    stack?: boolean;
    children: Snippet<[{ label: string; hint: string | undefined }]>;
  } = $props();

  const id = `setting-${Math.random().toString(36).slice(2)}`;
</script>

<div class="setting" class:sub class:off class:stack>
  <div>
    <div class="label" id="{id}-label">{label}</div>
    {#if hint}<div class="hint" id="{id}-hint">{hint}</div>{/if}
  </div>
  {@render children({ label: `${id}-label`, hint: hint ? `${id}-hint` : undefined })}
</div>
