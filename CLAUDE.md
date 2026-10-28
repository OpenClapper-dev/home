# OpenClapper home — agent guide

The public site at openclapper.org: an introduction page, a tester waiting list (double opt-in) and
a feature-request form, plus the owner's admin view. The app itself is in `OpenClapper-dev/core`;
this is the community space, and later the forum and job board live here too.

The owner talks to you in English.

## Read first

- `docs/README.md`: the docs index. `docs/architecture.md` first.
- Before changing a form, read `docs/forms.md`; update it (and `docs/api.md`) in the same commit when behaviour changes.

## Map

| Path | What |
| --- | --- |
| `apps/site/src` | The Worker: `index.ts` (entry, Access on `/admin`), `forms.ts` (the two forms + the confirmation link), `admin.ts`, `turnstile.ts`, `mail.ts`, `access.ts` + `http.ts` (copied from core's service-kit) |
| `apps/site/ui` | The pages (Vite, Preact): `index.html` + `src/Page.tsx`, `src/i18n.ts` (every string, English and German), `src/Waitlist.tsx`, `src/Requests.tsx`, `src/PersonFields.tsx`, `src/drafts.ts`, `src/turnstile.ts`; `admin/` + `src/admin/`; `privacy.html`; `public/_headers` (CSP) |
| `apps/site/migrations` | D1 schema, numbered, additive |
| `apps/site/test` | Route tests (vitest + the Cloudflare plugin, in workerd) |
| `packages/vocab` | Positions by department and the submission parsers: what the page and the Worker must agree on |
| `packages/ui` | The design system: tokens and component CSS **copied from core's `packages/ui`** (see its README), plus this site's components |

## Rules of the house

- **The design system is a copy.** Tokens and `design/*.css` come from core; change them there and copy, never fork them here. The components in `packages/ui/src/components.tsx` are this repository's own.
- **Shared rules go in `packages/vocab`** and the Worker validates with them.
- **Both forms are anonymous and behind Turnstile.** Nothing is stored before siteverify passed. The waiting list is double opt-in; the form never reveals whether an address is on the list.
- **Migrations**: a new numbered file for every change; never edit an applied one. Production holds real people's addresses: ask before anything destructive.
- **Match the surrounding code**: terse doc comments on exported functions explaining *why*; plain CSS on the design tokens, never hard-coded colours; both themes (Sun and Set) must stay high contrast. No new dependencies without a reason.
- **One version** in the root `package.json`.
- **CI is a gate**: never pass `--admin` to `gh pr merge`; a red check is fixed, not bypassed.
- **Deploys are done by the owner** from GitHub Actions (`Deploy`), reading everything from the `production` environment (`docs/deploying.md`). Scripts read the environment, never a settings file. The tracked `wrangler.jsonc` is local-dev only: never put an account, database or Access id in it. Commit only when asked or when working through an agreed plan; work on a branch.

## Verify before you say "done"

```sh
make check   # lint, typecheck, unit and route tests, build dry runs: the same lane CI runs
```

For the API, `make dev` and `curl` against `localhost:8790` (the Turnstile test keys always pass locally; `.dev.vars` has the secret, `scripts/dev-init.sh` writes it). The admin view is at `localhost:5180/admin/` without a sign-in locally. Say what was and was not clicked through.
