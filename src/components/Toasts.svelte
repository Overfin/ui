<!-- The messages of toast() (lib/toast), in the corner. Put one in the
     panel's root. -->
<script lang="ts">
  import { toasts } from '../lib/toast.svelte';
</script>

<div class="toasts" aria-live="polite">
  {#each toasts as t (t.id)}
    <div class="toast" class:error={t.error} role="status">{t.text}</div>
  {/each}
</div>
