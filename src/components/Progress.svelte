<!-- How far something is, 0 to 100: a <progress>, so no inline style. -->
<script lang="ts">
  let { value, label }: { value: number; label: string } = $props();

  // A value it can't show (not a number, below 0, above 100) would stop the
  // page: the browser refuses a <progress> value that isn't finite.
  const shown = $derived(Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0);
</script>

<progress class="bar" max="100" value={shown} aria-label={label}>{Math.round(shown)}%</progress>
