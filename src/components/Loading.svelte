<!-- While a page waits for the server. -->
<script lang="ts">
  import { word } from '../lib/labels.svelte';

  let { text = '' }: { text?: string } = $props();
</script>

<p class="loading" role="status">{text || word('loading')}</p>
