<!-- Parts of one thing shown one at a time: their names in a row (a tab
     list), the chosen part under it. The arrow keys move between the
     names, Home and End to the first and the last; Tab goes on into the
     part. -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    tabs,
    current = $bindable(),
    label,
    children,
  }: {
    tabs: { id: string; label: string }[];
    current: string;
    /** What the parts are of, for screen readers. */
    label: string;
    children: Snippet<[string]>;
  } = $props();

  const id = `tabs-${Math.random().toString(36).slice(2)}`;
  let list = $state<HTMLElement>();

  function key(e: KeyboardEvent) {
    const at = tabs.findIndex((t) => t.id === current);
    const to = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    current = tabs[(to + tabs.length) % tabs.length].id;
    list?.querySelector<HTMLElement>(`#${id}-${current}`)?.focus();
  }
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<div class="tabs" role="tablist" aria-label={label} bind:this={list} onkeydown={key}>
  {#each tabs as t (t.id)}
    <button type="button" role="tab" id="{id}-{t.id}" aria-selected={t.id === current} aria-controls="{id}-panel"
      tabindex={t.id === current ? 0 : -1} onclick={() => (current = t.id)}>{t.label}</button>
  {/each}
</div>
<div class="tab-panel" role="tabpanel" id="{id}-panel" aria-labelledby="{id}-{current}">
  {@render children(current)}
</div>
