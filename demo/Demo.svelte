<script lang="ts">
  import {
    Shell, PageHead, Card, Field, Setting, Badge, Notice, Status, Avatar, Secret, Loading, Empty,
    Stats, Busy, RowActions, Modal, FormModal, Dialogs, Toasts, Progress, Single, Tabs, ask, tell, toast, ago,
  } from '../src/index';
  import type { NavGroup } from '../src/index';

  const nav: NavGroup[] = [
    { items: [{ href: '#home', label: 'Home', icon: ['M3 11l9-7 9 7', 'M5 10v10h14V10'] }] },
    { label: 'Library', items: [
      { href: '#services', label: 'Services', icon: ['M4 6h16', 'M4 12h16', 'M4 18h16'] },
      { href: '#settings', label: 'Settings', icon: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'] },
    ] },
  ];

  let services = $state([
    { id: 1, name: 'Radarr', url: 'http://192.0.2.10:7878', ok: true, seen: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 2, name: 'Sonarr', url: 'http://192.0.2.10:8989', ok: false, seen: new Date(Date.now() - 3 * 3600000).toISOString() },
  ]);
  let editing = $state<{ id: number; name: string; url: string } | null>(null);
  let daily = $state(10);
  let on = $state(true);
  let fail = $state(false);
  // The parts of the demo not in the page above: a page without the
  // sidebar, a window, tabs and progress.
  let single = $state(false);
  let window = $state(false);
  let part = $state('disks');

  async function remove(id: number, name: string) {
    if (await ask(`Delete ${name}? Overswell stops using it.`, { yes: 'Delete', danger: true })) {
      services = services.filter((s) => s.id !== id);
      toast(`${name} deleted.`);
    }
  }

  async function save() {
    await new Promise((r) => setTimeout(r, 400));
    if (fail) throw new Error('The service did not answer.');
    const e = editing!;
    services = services.map((s) => (s.id === e.id ? { ...s, name: e.name, url: e.url } : s));
    toast('Saved.');
  }
</script>

{#if single}
<Single name="Overswell">
  <section>
    <h2>Sign in</h2>
    <Notice>A page without the sidebar: signing in, setting up.</Notice>
    <Progress value={40} label="Setting up" />
    <div class="wizard-foot"><button type="button" class="primary" onclick={() => (single = false)}>Back to the panel</button></div>
  </section>
</Single>
{:else}
<Shell name="Overswell" subtitle="Adding" logo="" {nav} active="#services" who="admin@example.org" signOut={() => toast('Signed out.')}>
  <PageHead title="Services" description="Radarr and Sonarr, where Overswell adds titles.">
    {#snippet actions()}
      <button class="primary" type="button" onclick={() => (editing = { id: 0, name: '', url: '' })}>Add a service</button>
    {/snippet}
  </PageHead>

  <Notice>Dry run is on: Overswell changes nothing in Radarr or Sonarr.</Notice>
  <Notice warn>Prowlarr gives no daily limit for one tracker.</Notice>

  <Stats items={[{ value: 12, label: 'waiting' }, { value: 3, label: 'today' }, { value: 41, label: 'added' }]} />

  <div class="table-wrap spaced">
    <table>
      <thead><tr><th>Service</th><th class="hide-narrow">Address</th><th>State</th><th class="hide-narrow">Seen</th><th></th></tr></thead>
      <tbody>
        {#each services as s (s.id)}
          <tr>
            <td><div class="who"><Avatar name={s.name} /><div><div class="name">{s.name}</div></div></div></td>
            <td class="mono hide-narrow">{s.url}</td>
            <td>{#if s.ok}<Badge kind="ok">Answers</Badge>{:else}<Badge kind="err">No answer</Badge>{/if}</td>
            <td class="hide-narrow">{ago(s.seen)}</td>
            <RowActions name={s.name} edit={() => (editing = { ...s })} remove={() => remove(s.id, s.name)} />
          </tr>
        {:else}
          <tr><td colspan="5"><Empty>No service yet.</Empty></td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="cards spaced">
    <Card title="Adding" description="How many titles a day, and when.">
      {#snippet badge()}<Badge kind="info">Dry run</Badge>{/snippet}
      <Setting label="Adding" hint="Off: Overswell only watches.">
        {#snippet children(ids)}<input type="checkbox" bind:checked={on} aria-labelledby={ids.label} aria-describedby={ids.hint} />{/snippet}
      </Setting>
      <Setting label="Titles a day" hint="At most." sub off={!on}>
        {#snippet children(ids)}<input type="number" min="1" bind:value={daily} aria-labelledby={ids.label} aria-describedby={ids.hint} />{/snippet}
      </Setting>
      {#snippet foot()}
        <Status text="Saved 2 min ago." kind="ok" />
        <Busy kind="primary" action={() => new Promise((r) => setTimeout(r, 600)).then(() => toast('Saved.'))}>Save</Busy>
      {/snippet}
    </Card>
    <Card title="Windows" description="Confirmations and messages.">
      <div class="actions-row">
        <button type="button" onclick={() => tell('Done', 'The search ran; nothing new.')}>Tell</button>
        <button type="button" onclick={() => toast('Something failed.', true)}>Error toast</button>
        <Busy action={() => Promise.reject(new Error('Prowlarr did not answer.'))}>Failing action</Busy>
      </div>
      <div class="spaced"></div>
      <Secret value="ovs_3f9a1c2b7d">Overswell's key, shown once:</Secret>
      <Loading />
    </Card>
    <Card title="Parts" description="Tabs, progress, a window, a page without the sidebar.">
      <Tabs tabs={[{ id: 'disks', label: 'Disks' }, { id: 'queue', label: 'Queue' }]} bind:current={part} label="Storage">
        {#snippet children(id)}
          {#if id === 'disks'}<Progress value={72} label="Disk used" />{:else}<Empty>Nothing waiting.</Empty>{/if}
        {/snippet}
      </Tabs>
      <div class="actions-row spaced">
        <button type="button" onclick={() => (window = true)}>Window</button>
        <button type="button" onclick={() => (single = true)}>Page without the sidebar</button>
      </div>
    </Card>
  </div>
</Shell>
{/if}

{#if window}
  <Modal title="A window" description="What it holds, then its buttons." close={() => (window = false)}>
    <p>Escape, the close button or a click outside close it.</p>
    {#snippet foot()}<button type="button" class="primary" onclick={() => (window = false)}>Done</button>{/snippet}
  </Modal>
{/if}

{#if editing}
  <FormModal title={editing.id ? `Edit ${editing.name}` : 'Add a service'} description="Its address and API key." {save} close={() => (editing = null)}>
    <div class="fields">
      <Field label="Name"><input bind:value={editing.name} required /></Field>
      <Field label="Address" hint="With http:// or https://." wide><input bind:value={editing.url} required /></Field>
    </div>
    <label class="inline"><input type="checkbox" bind:checked={fail} /> Make saving fail</label>
  </FormModal>
{/if}

<Dialogs />
<Toasts />
