<!-- The messages of toast() (lib/toast), in the corner. Put one in the
     panel's root. -->
<script lang="ts">
  import { toasts } from '../lib/toast.svelte';

  // An open window (a modal <dialog>) sits in the browser's top layer, above
  // anything a z-index can lift: a message said from inside it, a failure
  // above all, would be hidden behind it. The messages are a popover, shown
  // again for each new one so they come above the newest window too.
  let box = $state<HTMLDivElement>();
  $effect(() => {
    const n = toasts.length;
    const el = box;
    if (!el || typeof el.showPopover !== 'function') return;
    try {
      if (el.matches(':popover-open')) el.hidePopover();
      if (n > 0) el.showPopover();
    } catch {
      // Not connected yet, or no popovers in this browser: the corner as before.
    }
  });
</script>

<div class="toasts" popover="manual" aria-live="polite" bind:this={box}>
  {#each toasts as t (t.id)}
    <div class="toast" class:error={t.error} role="status">{t.text}</div>
  {/each}
</div>
