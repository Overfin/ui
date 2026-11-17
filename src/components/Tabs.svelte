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

  // The tab shown as chosen: the current one, or the first when current
  // names none of them (so Tab still reaches the list).
  const chosen = $derived(tabs.some((t) => t.id === current) ? current : (tabs[0]?.id ?? ''));
  // Each tab's element id: by its place, since a tab's id may hold any
  // character (a space, a slash) and the element ids are only ours.
  const at = $derived(Math.max(0, tabs.findIndex((t) => t.id === chosen)));

  function key(e: KeyboardEvent) {
    if (tabs.length === 0) return;
    // On a right-to-left page the next tab is on the left.
    const next = list && getComputedStyle(list).direction === 'rtl' ? -1 : 1;
    const to = { ArrowRight: at + next, ArrowLeft: at - next, Home: 0, End: tabs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const i = (to + tabs.length) % tabs.length;
    current = tabs[i].id;
    list?.querySelectorAll<HTMLElement>('[role=tab]')[i]?.focus();
  }
</script>

<!-- The list scrolls sideways when the names don't fit, and Firefox makes
     a strip that scrolls a Tab stop of its own: tabindex -1 keeps it out
     (the arrows bring each tab into view). -->
<div class="tabs" role="tablist" aria-label={label} tabindex="-1" bind:this={list} onkeydown={key}>
  {#each tabs as t, i (t.id)}
    <button type="button" role="tab" id="{id}-{i}" aria-selected={t.id === chosen} aria-controls="{id}-panel"
      tabindex={t.id === chosen ? 0 : -1} onclick={() => (current = t.id)}>{t.label}</button>
  {/each}
</div>
<div class="tab-panel" role="tabpanel" id="{id}-panel" aria-labelledby={tabs.length ? `${id}-${at}` : undefined}>
  {@render children(current)}
</div>
