<!-- How far something is, 0 to 100: a <progress>, so no inline style. -->
<script lang="ts">
  let { value, label }: { value: number; label: string } = $props();
</script>

<progress class="bar" max="100" value={value} aria-label={label}>{value}%</progress>
