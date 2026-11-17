<!-- A circled "?" beside a title, that says what the thing is: opened and
     closed by a click, a tap, Enter or Space (no hover, which phones and
     TV remotes don't have), closed by Escape or a click elsewhere. Its own
     look, from the theme's values, so the site can use it as well as the
     panels. -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { word } from '../lib/labels.svelte';

  let { text, label = '' }: { text: string; label?: string } = $props();

  let open = $state(false);
  let box = $state<HTMLElement | null>(null);
  let bubble = $state<HTMLElement | null>(null);
  // How far the bubble moves left (or right, below 0) to stay on the
  // screen: it opens under the mark, but a mark near an edge (a phone)
  // would push it out.
  let shift = $state(0);
  const margin = 8;

  $effect(() => {
    if (!open || !bubble) return;
    // Where it would be unmoved: its place now, the shift already applied
    // taken off.
    const applied = untrack(() => shift);
    const r = bubble.getBoundingClientRect();
    const left = r.left + applied, rightEdge = r.right + applied;
    const over = rightEdge - (document.documentElement.clientWidth - margin);
    shift = over > 0 ? Math.min(over, left - margin) : left < margin ? left - margin : 0;
  });
  const id = `help-${Math.random().toString(36).slice(2, 10)}`;

  $effect(() => {
    if (!open) return;
    const away = (e: Event) => {
      if (box && !box.contains(e.target as Node)) open = false;
    };
    // Escape closes the help; pressed on it, the help only: in a window,
    // the window stays (a second Escape closes it).
    const escape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (box?.contains(document.activeElement)) e.preventDefault();
      open = false;
    };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', escape);
    };
  });
</script>

<span class="help" bind:this={box}>
  <button type="button" class="mark" aria-label={label || word('whatIsThis')} aria-expanded={open} aria-controls={id} onclick={() => (open = !open)}>?</button>
  {#if open}<span class="bubble" id={id} role="note" bind:this={bubble} style:transform={shift ? `translateX(${-shift}px)` : undefined}>{text}</span>{/if}
</span>

<style>
  .help { position: relative; display: inline-flex; align-items: center; vertical-align: middle; margin-left: 0.45em; }
  /* A fixed size whatever the title's: the panels' and the site's button
     styles (padding, heights) don't reach it. */
  .mark {
    box-sizing: border-box; flex: none;
    width: 1.25rem; height: 1.25rem; min-width: 0; min-height: 0; padding: 0; margin: 0; border-radius: 50%;
    border: 1.5px solid var(--muted, #888); background: transparent; color: var(--muted, #888); box-shadow: none;
    font: 700 0.75rem/1 var(--font, inherit); text-transform: none; letter-spacing: 0; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .mark:hover, .mark[aria-expanded='true'] { border-color: var(--text, #222); color: var(--text, #222); }
  .mark:focus-visible { outline: 2px solid var(--accent, #2b6cb0); outline-offset: 2px; }
  .bubble {
    position: absolute; z-index: 50; top: calc(100% + 0.4em); left: 0;
    width: max-content; max-width: min(22em, 80vw);
    padding: 0.6em 0.8em; border-radius: var(--radius-s, 6px);
    background: var(--panel, #fff); color: var(--text, #222); border: 1px solid var(--border, #ddd);
    box-shadow: var(--shadow, 0 4px 16px rgba(0, 0, 0, 0.2));
    font: 400 0.875rem/1.45 var(--font, inherit); text-transform: none; letter-spacing: normal; white-space: normal;
  }
</style>
