<!-- A button whose action waits for the server: it's disabled until the
     action is done, and a failure is said in a toast (or by fail). -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { toast } from '../lib/toast.svelte';

  let {
    action,
    fail = (err: Error) => toast(err.message, true),
    kind = '',
    small = false,
    disabled = false,
    label = '',
    children,
  }: {
    action: () => Promise<unknown> | unknown;
    fail?: (err: Error) => void;
    kind?: '' | 'primary' | 'danger' | 'ghost' | 'link';
    small?: boolean;
    disabled?: boolean;
    /** label: what a screen reader says, when the text isn't enough. */
    label?: string;
    children: Snippet;
  } = $props();

  let running = $state(false);

  async function run() {
    running = true;
    try {
      await action();
    } catch (err) {
      fail(err instanceof Error ? err : new Error(String(err)));
    } finally {
      running = false;
    }
  }
</script>

<button type="button" class={kind} class:small disabled={disabled || running} aria-label={label || undefined} onclick={run}>{@render children()}</button>
