<!-- The messages of toast() (lib/toast), in the corner. Put one in the
     panel's root. -->
<script lang="ts">
  import { said, toasts } from '../lib/toast.svelte';

  // An open window (a modal <dialog>) sits in the browser's top layer, above
  // anything a z-index can lift: a message said from inside it, a failure
  // above all, would be hidden behind it. The messages are a popover, shown
  // again for each new one so they come above the newest window too.
  let box = $state<HTMLDivElement>();
  function raise() {
    const el = box;
    if (!el || typeof el.showPopover !== 'function') return;
    try {
      if (el.matches(':popover-open')) el.hidePopover();
      if (toasts.length > 0) el.showPopover();
    } catch {
      // Not connected yet, or no popovers in this browser: the corner as before.
    }
  }
  $effect(() => {
    void toasts.length;
    raise();
  });
  // A window opened after a message: the message comes above it again.
  $effect(() => {
    document.addEventListener('kit-window', raise);
    return () => document.removeEventListener('kit-window', raise);
  });
</script>

<!-- Read out from a region always there (a popover hidden is out of the
     page, and a region that appears with its words in it isn't read). -->
<div class="visually-hidden" role="status" aria-live="polite">{said.text}</div>
<div class="toasts" popover="manual" aria-hidden="true" bind:this={box}>
  {#each toasts as t (t.id)}
    <div class="toast" class:error={t.error}>{t.text}</div>
  {/each}
</div>
