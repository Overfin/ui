<!-- A window over the page: its title and description, what it holds, then
     its buttons (foot). Nothing is edited in place: a list opens its forms
     in one of these. Escape, the close button or a click outside close it,
     unless it's busy (a save under way). The first field gets the focus. -->
<script module lang="ts">
  // Where a window that just closed sends the focus back. A window opened
  // right after it (a form, then its result) finds the focus on nothing,
  // since the first one is gone: it takes this instead, so the focus still
  // ends on the button that started the chain.
  let returning: HTMLElement | null = null;
  // How many windows are open: one opened over another doesn't darken the
  // page again (the first one did); while any is, the page behind holds
  // still (html.modal-open).
  let open = 0;
</script>

<script lang="ts">
  import { onDestroy, type Snippet } from 'svelte';
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

  // What had the focus when the window opened (its button, usually) gets it
  // back when the window closes, so a keyboard carries on from there.
  const focused = document.activeElement as HTMLElement | null;
  const opener = !focused || focused === document.body ? returning : focused;
  const stacked = open > 0;
  if (open++ === 0) document.documentElement.classList.add('modal-open');
  onDestroy(() => {
    if (--open === 0) document.documentElement.classList.remove('modal-open');
    returning = opener;
    requestAnimationFrame(() => {
      if (returning === opener) returning = null;
      if (opener?.isConnected && !(opener as HTMLButtonElement).disabled) opener.focus({ preventScroll: true });
    });
  });

  $effect(() => {
    if (!element || element.open) return;
    element.showModal();
    element.querySelector<HTMLElement>('.modal-body input:not([type=checkbox]):not([readonly]), .modal-body select, .modal-body textarea')?.focus({ preventScroll: true });
  });

  function shut() {
    if (!busy) close();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog class="modal" class:wide={size === 'wide'} class:small={size === 'small'} class:stacked bind:this={element}
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
