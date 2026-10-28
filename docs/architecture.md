# Architecture

One Cloudflare Worker (`apps/site`) on openclapper.org:

| Path | What | Who |
| --- | --- | --- |
| `/`, `/privacy.html`, `/icons/…` | Static pages (Workers assets, built by Vite from `apps/site/ui`) | everyone |
| `/api/waitlist`, `/api/requests` | The two forms (POST, JSON, Turnstile token inside) | everyone, bots filtered |
| `/api/waitlist/confirm/:token` | The link in the confirmation mail | whoever has the mail |
| `/admin/`, `/admin/api/*` | The owner's view and its API | only through the Cloudflare Access application on `/admin` |

**Storage**: D1 (`openclapper-home`), three tables (`apps/site/migrations`): `waitlist`, `requests`, `request_entries`.

**Mail**: Cloudflare Email Service through the `send_email` binding; the only mail is the waiting list's confirmation link. The sender domain is onboarded on the account once (docs/deploying.md).

**Bot check**: Cloudflare Turnstile. The widget runs on both forms; the Worker verifies the token with siteverify (action and hostname checked) before it touches the database.

**Admin**: the Worker verifies the Access JWT (`Cf-Access-Jwt-Assertion`) on everything under `/admin`, the page included, with the same code as core's admin plane. Locally there is no Access; `.dev.vars` sets `ADMIN_DEV_BYPASS`, honoured only for requests to localhost.

**Shared code**: `packages/vocab` (positions, submission parsing) is imported by the page and the Worker. `packages/ui` is the design system, copied from core (docs/design.md).

**The page** is Preact, built with Vite, three entries: the page, the privacy page, the admin view. The theme (Sun / Set) is set before first paint by an inline script, allowed by hash in the CSP (`apps/site/ui/public/_headers`; `scripts/csp-hash.mjs` keeps the two in step).
