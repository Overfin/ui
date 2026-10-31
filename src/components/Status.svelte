<!-- A line that says where something stands, or what went wrong. -->
<script lang="ts">
  let { text = '', kind = '' }: { text?: string; kind?: '' | 'ok' | 'error' } = $props();
</script>

<span class="status {kind}" role={kind === 'error' && text ? 'alert' : undefined}>{text}</span>
