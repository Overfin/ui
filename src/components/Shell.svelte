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

  // On a narrow screen the sidebar is a bar on top, and the menu opens
  // from its Menu button, over the page; picking a page closes it.
  let open = $state(false);
  let toggle = $state<HTMLButtonElement>();
  let page = $state<HTMLElement>();
  const navId = `nav-${Math.random().toString(36).slice(2)}`;
  $effect(() => {
    void active;
    open = false;
  });

  function key(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      open = false;
      toggle?.focus();
    }
  }

  // Skipping the menu: the focus goes to the page itself. A link to an
  // anchor would change the address, which the panels' pages are named by.
  function skip(e: MouseEvent) {
    e.preventDefault();
    page?.focus();
  }
</script>

<div class="shell">
  <a class="skip-link" href="#page" onclick={skip}>{word('skip')}</a>
  <!-- tabindex -1: the sidebar scrolls when the menu is long, and Firefox
       makes what scrolls a Tab stop of its own. -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <aside class="sidebar" aria-label={name} tabindex="-1" onkeydown={key}>
    <div class="brand">
      {#if logo}<img class="logo" src={logo} alt="" />{/if}
      <div><strong>{name}</strong>{#if subtitle}<small>{subtitle}</small>{/if}</div>
    </div>
    {#if nav.length > 0}
      <button type="button" class="menu-toggle ghost" bind:this={toggle} aria-expanded={open} aria-controls={navId} onclick={() => (open = !open)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        {word('menu')}
      </button>
      <nav id={navId} class:open aria-label={word('menu')} tabindex="-1">
        {#each nav as group, g (g)}
          {#if group.label}<div class="group">{group.label}</div>{/if}
          {#each group.items as item, n (n)}
            <a href={item.href} class:active={item.href === active} aria-current={item.href === active ? 'page' : undefined} onclick={() => (open = false)}>
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
  <main class:wide id="page" tabindex="-1" bind:this={page}>{@render children()}</main>
</div>
