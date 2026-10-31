<!-- A section of a page: its head (title, description, a badge), what it
     holds, and a foot for its status and buttons. -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title = '',
    description = '',
    badge,
    children,
    foot,
  }: { title?: string; description?: string; badge?: Snippet; children?: Snippet; foot?: Snippet } = $props();
</script>

<section>
  {#if title || badge}
    <div class="card-head">
      <div>
        {#if title}<h2>{title}</h2>{/if}
        {#if description}<p>{description}</p>{/if}
      </div>
      {@render badge?.()}
    </div>
  {/if}
  {@render children?.()}
  {#if foot}<div class="card-foot">{@render foot()}</div>{/if}
</section>
