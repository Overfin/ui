<!-- A row of numbers, each with what it counts. -->
<script lang="ts">
  let { items }: { items: { value: string | number; label: string }[] } = $props();
</script>

<div class="stats">
  {#each items as s (s.label)}
    <div class="stat"><b>{s.value}</b><span>{s.label}</span></div>
  {/each}
</div>
