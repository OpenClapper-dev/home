# API

All JSON. Errors: `{ "error": "…" }`, with `"field"` on a 400 from validation. Every route is covered
by `apps/site/test/site.test.ts`, which also fails when a route is added without a test.

## Public

| Route | Body | Answer |
| --- | --- | --- |
| `POST /api/waitlist` | `{ email, nickname?, system?, positions?: string[], other_position?, years?, turnstile }` | `200 { ok: true }` always (see forms.md); `400` field error; `403` bot check failed; `502` mail failed |
| `GET /api/waitlist/confirm/:token` | | `303` to `/?confirmed=yes#waitlist` or `/?confirmed=no#waitlist` |
| `POST /api/requests` | `{ entries: [{ title?, text, test?, prototype? }], system?, positions?, other_position?, years?, contact?, turnstile }` | `201 { ok: true, id }`; `400`; `403` |

Bodies over 256 KB answer `413`; a content type other than `application/json` answers `415`.

## Admin (behind Access)

| Route | What |
| --- | --- |
| `GET /admin/api/whoami` | `{ email }` of the operator |
| `GET /admin/api/waitlist` | every row, newest first, positions as a list |
| `GET /admin/api/waitlist.csv` | the confirmed rows as CSV |
| `PATCH /admin/api/waitlist/:id` | `{ invited: boolean }` |
| `DELETE /admin/api/waitlist/:id` | |
| `GET /admin/api/requests` | every submission with its entries |
| `PATCH /admin/api/requests/:id` | `{ status: "new" \| "seen" \| "done" }` |
| `DELETE /admin/api/requests/:id` | the entries go with it |

Anything under `/admin` without a valid Access JWT of the admin application answers `401`, the page included.
