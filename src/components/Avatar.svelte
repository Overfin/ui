<!-- Someone's initials on a color of their own: one of eight classes, no
     inline style (the panels' pages allow none). -->
<script lang="ts">
  import { hue, initials } from '../lib/format';

  let { name, big = false }: { name: string; big?: boolean } = $props();
</script>

<span class="avatar c{hue(name)}" class:big aria-hidden="true">{initials(name)}</span>
