# The forms

Both forms are anonymous, need no account, and are behind Turnstile. A submission is validated with
`packages/vocab` (`parseWaitlist`, `parseRequest`), on the page before sending and again in the Worker.
A 400 names the field (`{ error, field }`) and the page shows it under that field.

## About you (both forms)

Optional in both: the **film system** worked in (German, US / International, Other), **positions** (many, from `packages/vocab/src/positions.ts`, grouped by department,
with a filter that also hits the German titles; "Other" opens a free text), and **years in the industry**
(one number, across every position). Departments are derived from the positions, never asked.

## Sign-up: the tester waiting list and the Call Sheet

One form, one table (`waitlist`). Fields: **email** (required); **what for** (`tester`, the default, and/or
`updates`, the Call Sheet: a mail whenever the roadmap moves a step; at least one); for testers the
**platforms** they could test on (`web`, `android`, `ios`; at least one); first name or nickname; about you.

Double opt-in: the Worker stores the row unconfirmed with a 48-hex token and sends the confirmation
link (`/api/waitlist/confirm/<token>`) through Cloudflare Email Service. The link confirms once, clears
the token, and lands on `/?confirmed=yes#waitlist` (a banner on the page); an unknown, used or older
than 7-day link lands on `/?confirmed=no#waitlist`.

The form never reveals whether an address is on the list: a confirmed address answers like a new one
(no mail); an unconfirmed one gets the mail again, with a fresh token, at most once per 10 minutes.
A failed mail keeps the row and answers 502, so the person can try again.

The admin view marks confirmed rows as invited and exports the confirmed ones as CSV (`/admin/api/waitlist.csv`).

## Feature requests

One submission carries one or many **entries**: optional title, required text, and per entry "I would
test this once it exists" and "ask me questions while it takes shape". Then once per submission: **how
to reach you** as free text (an email, a handle; required once an entry asks to test or to be contacted),
**platforms** (required once an entry asks to test), and about you.

Stored as one `requests` row and one `request_entries` row per entry, in order. The admin view shows
them per submission with a status (new / seen / done).

## Drafts

Each form keeps its unsent state in `localStorage` (`draft:waitlist`, `draft:requests`), written on
every change, restored on the next visit with a "Start over" link, cleared when the form was sent.
Sent submissions are not kept in the browser (the owner's choice). Storage being unavailable just
means no draft.

## Turnstile

`apps/site/ui/src/turnstile.ts` renders one widget per form (explicit mode, `action` = `waitlist` or
`request`, theme following the page). The token goes into the JSON body; the Worker verifies it with
siteverify, checks the action and that the hostname is the site's own (`SITE_URL`), and resets nothing
itself: the page resets the widget after every submission. Locally and in CI the page uses Cloudflare's
visible test site key and `.dev.vars` the matching test secret, which always pass.

## Language

Everything is English (`apps/site/ui/src/copy.ts` holds every string of the page, the forms and the
privacy page); there is no localisation. The request form says that requests may be written in German.
Position and department labels are English; the filter also hits the German titles.
