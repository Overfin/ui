<!-- A window over the page: its title and description, what it holds, then
     its buttons (foot). Nothing is edited in place: a list opens its forms
     in one of these. Escape, the close button or a click outside close it,
     unless it's busy (a save under way). The first field gets the focus. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { word } from '../lib/labels.svelte';

  let {
    title,
    description = '',
    size = 'normal',
    busy = false,
    alert = false,
    close,
    children,
    foot,
  }: {
    title: string;
    description?: string;
    size?: 'normal' | 'wide' | 'small';
    busy?: boolean;
    /** alert: a question that needs an answer (role alertdialog). */
    alert?: boolean;
    close: () => void;
    children: Snippet;
    foot?: Snippet;
  } = $props();

  let element = $state<HTMLDialogElement>();
  const id = `modal-${Math.random().toString(36).slice(2)}`;

  $effect(() => {
    if (!element || element.open) return;
    element.showModal();
    element.querySelector<HTMLElement>('.modal-body input:not([type=checkbox]):not([readonly]), .modal-body select, .modal-body textarea')?.focus();
  });

  function shut() {
    if (!busy) close();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog class="modal" class:wide={size === 'wide'} class:small={size === 'small'} bind:this={element}
  role={alert ? 'alertdialog' : undefined} aria-labelledby={id}
  oncancel={(e) => { e.preventDefault(); shut(); }}
  onclick={(e) => { if (e.target === element) shut(); }}>
  <div class="card-head">
    <div>
      <h2 {id}>{title}</h2>
      {#if description}<p>{description}</p>{/if}
    </div>
    <button type="button" class="close" aria-label={word('close')} title={word('close')} onclick={shut}>×</button>
  </div>
  <div class="modal-body">{@render children()}</div>
  {#if foot}<div class="card-foot">{@render foot()}</div>{/if}
</dialog>
