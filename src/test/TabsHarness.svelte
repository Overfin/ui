<!-- Tabs as a page holds them: the chosen one bound. -->
<script lang="ts">
  import Tabs from '../components/Tabs.svelte';

  let { tabs, current = $bindable(), label = 'Storage' }: { tabs: { id: string; label: string }[]; current: string; label?: string } = $props();
</script>

<Tabs {tabs} bind:current {label}>
  {#snippet children(id)}<p class="shown">Part {id}</p><button type="button" class="inside">Inside</button>{/snippet}
</Tabs>
<p class="bound">{current}</p>
