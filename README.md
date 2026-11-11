# Overfin UI

The look and the shared [Svelte](https://svelte.dev) components of Overfin's
panels: [Overfin](https://github.com/overfin/server)'s control panel and
setup, [Overtide](https://github.com/overfin/overtide) and
[Overswell](https://github.com/overfin/overswell). One place for all of
them, so they look, feel and work the same. Overfin's site
([overfin-web](https://github.com/overfin/web)) is a different kind of app
and doesn't use it.

- `theme.css`: the values (colors dark and light, corners, shadows, font).
- `admin.css`: the panels' layout and components, plain classes (`section`,
  `table`, `.field`, `.setting`, `.badge`, `.notice`…).
- Components: `Shell` (the sidebar and the page), `PageHead`, `Card`,
  `Field`, `Setting`, `Badge`, `Notice`, `Status`, `Stats`, `Avatar`,
  `Secret`, `Loading`, `Empty`, `Busy` (a button that waits for the server),
  `RowActions` (Edit, Delete), `Modal`, `FormModal`, `Dialogs` and `ask` /
  `tell` (confirmations), `Toasts` and `toast`, `Tabs` (parts of one thing,
  one at a time; arrow keys between them), `Progress` (how far something
  is), `Single` (a page without the sidebar: signing in, setting up).
- Helpers: `setLanguage` and `word` (the kit's own few words), `ago`,
  `day` and `when` (times as the panels show them).

Nothing is edited in place: a list shows its rows with Edit and Delete, and
forms open in a `FormModal`; a new one too.

A few plain classes cover what tables and lists need: `visually-hidden` (a
column's name only screen readers hear, over its row buttons), `button.pick`
(a row's name that selects the row, so the keyboard reaches it), and `th a`
(a column header that sorts, `.on` on the column sorted on), and
`.image-choices` (pictures to choose one of: buttons holding them, the chosen
one `aria-pressed`; `.wide` for backdrops, `.logos` for logos). Windows give the
keyboard focus back to the button that opened them when they close.

## Using it

A panel installs a tagged version from GitHub (install scripts stay off):

```sh
npm install --save-exact github:overfin/ui#v0.4.9
```

```ts
// main.ts
import '@overfin/ui/theme.css';
import '@overfin/ui/admin.css';
```

```svelte
<script lang="ts">
  import { Shell, PageHead, FormModal, Dialogs, Toasts, ask, toast } from '@overfin/ui';
</script>

<Shell name="Overswell" nav={[{ items: [{ href: '/', label: 'Home' }] }]} active="/">
  <PageHead title="Home" />
</Shell>
<Dialogs />
<Toasts />
```

The package is the sources (Svelte and TypeScript): the panel's own Vite
build, with `vitePreprocess`, compiles them.

## Working on it

```sh
npm install
npm run dev     # the demo: every component on one page (demo/)
npm run check   # types
npm test        # unit tests
```

## How it's made

Overfin UI is designed by its maintainer, who makes the architecture, security and product decisions, and written by Claude (Anthropic's AI); Claude's commits carry a `Co-Authored-By: Claude` trailer. The code is checked by its type check, its tests and screenshots of the panels built on it; it hasn't had an independent security review yet.

## License

MIT, see [LICENSE](LICENSE).
