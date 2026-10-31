# Security

Overfin UI is part of Overfin's panels: the rules it follows (text from a
server is only ever text, which Svelte escapes, never `{@html}`; no inline
styles, so the panels' pages can forbid them; nothing loaded from or sent
to a third party) are part of Overfin's, in its
[SECURITY.md](https://github.com/overfin/server/blob/main/SECURITY.md).

## Reporting a vulnerability

Please report it privately, through this repository's **Security** tab
(*Report a vulnerability*), not in a public issue. You'll get an answer, and
credit if you'd like it, once it's fixed.
