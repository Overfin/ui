# Overfin UI

The shared look and Svelte components of Overfin's panels: Overfin's
control panel and setup, Overtide, Overswell. Not the site (overfin-web).
MIT, public, part of the Overfin project.

## Non-negotiable
- Never copy or port code from other projects. Build from Svelte's docs.
- One look for every panel: a change here is a change in all of them, so a
  panel never restyles the kit in its own stylesheet; fix it here.
- Nothing is edited in place: lists with Edit/Delete, forms in a
  `FormModal`, confirmations with `ask`, never the browser's dialogs.
- No `{@html}`, no inline styles (`style=`, `style:`): the panels' CSP
  forbids them.
- No runtime dependency besides Svelte. Any new dev dependency needs a
  stated reason.
- This repo is public. Never commit details of the maintainer's own setup:
  domains, IPs, hostnames, usernames, emails or secrets. Use `example.org`
  and documentation IPs (192.0.2.0/24, 198.51.100.0/24) in examples.
- AI assistance is always disclosed: keep the README's "AI-assisted
  development" section accurate, and end commits Claude contributed to with a
  `Co-Authored-By: Claude ...` trailer.
- Nobody reviews your code after you: the maintainer gives directions and
  uses the result, but doesn't read the code line by line. So check your
  own work: `npm run check`, `npm test`, the demo screenshotted dark, light
  and on a phone, and say plainly what you didn't check.

## Style
- Svelte 5 runes, TypeScript, plain and readable.
- Styles live in `src/admin.css` (global, plain classes), values in
  `src/theme.css`; components carry no `<style>`.
- The package ships its sources; each panel's Vite build compiles them.
  Releases are git tags (`v0.1.0`), which the panels install.

## Layout
- `src/components`: the components
- `src/lib`: dialogs, toasts, the kit's words, formatting
- `src/index.ts`: what the package exports
- `demo/`: every component on one page
