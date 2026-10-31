<!-- A panel's frame: the sidebar (the panel's name, its menu, who is signed
     in) and the page. On a narrow screen the sidebar becomes a bar on top. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { word } from '../lib/labels.svelte';
  import type { NavGroup } from '../lib/nav';

  let {
    name,
    subtitle = '',
    logo = '',
    nav = [],
    active = '',
    who = '',
    signOut,
    wide = false,
    extra,
    children,
  }: {
    name: string;
    subtitle?: string;
    logo?: string;
    nav?: NavGroup[];
    /** active: the href of the page shown. */
    active?: string;
    who?: string;
    signOut?: () => void;
    /** wide: the page takes the whole width (long tables). */
    wide?: boolean;
    /** extra: what the sidebar shows above who is signed in (a panel's
     * running operations, say). */
    extra?: Snippet;
    children: Snippet;
  } = $props();
</script>

<div class="shell">
  <aside class="sidebar" aria-label={name}>
    <div class="brand">
      {#if logo}<img class="logo" src={logo} alt="" />{/if}
      <div><strong>{name}</strong>{#if subtitle}<small>{subtitle}</small>{/if}</div>
    </div>
    {#if nav.length > 0}
      <nav aria-label={word('menu')}>
        {#each nav as group, g (g)}
          {#if group.label}<div class="group">{group.label}</div>{/if}
          {#each group.items as item (item.href)}
            <a href={item.href} class:active={item.href === active} aria-current={item.href === active ? 'page' : undefined}>
              {#if item.icon}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  {#each item.icon as d, i (i)}<path {d} />{/each}
                </svg>
              {/if}
              {item.label}
            </a>
          {/each}
        {/each}
      </nav>
    {/if}
    {#if extra}<div class="sidebar-extra">{@render extra()}</div>{/if}
    {#if who || signOut}
      <div class="me">
        {#if who}<span class="who-name">{who}</span>{/if}
        {#if signOut}<button class="ghost small" type="button" onclick={signOut}>{word('signOut')}</button>{/if}
      </div>
    {/if}
  </aside>
  <main class:wide>{@render children()}</main>
</div>
