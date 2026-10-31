<!-- A page without the sidebar, in one column: signing in, setting up. -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { name, logo = '', children }: { name: string; logo?: string; children: Snippet } = $props();
</script>

<main class="single">
  <div class="brand">
    {#if logo}<img class="logo" src={logo} alt="" />{/if}
    <div><h1>{name}</h1></div>
  </div>
  {@render children()}
</main>
