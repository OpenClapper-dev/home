# The forms

Both forms are anonymous, need no account, and are behind Turnstile. A submission is validated with
`packages/vocab` (`parseWaitlist`, `parseRequest`), on the page before sending and again in the Worker.
A 400 names the field (`{ error, field }`) and the page shows it under that field.

## About you (both forms)

Required on both forms, no name anywhere: the **film systems** worked in (many: German, US / International,
Other), **positions** (many, from `packages/vocab/src/positions.ts`, grouped by department, with a filter
that also hits the German titles; "Other" requires a free text), **years in the industry** as a band
(`lt1`, `1-3`, `3-6`, `6-9`, `9-12`, `12+`), and the **languages** to test or answer questions in (many:
German, English, Other; "Other" requires the language). Departments are derived from the positions, never asked.
The owner needs all of it to see which direction input comes from and to pick a varied group of testers.

## Sign-up: the tester waiting list and the Call Sheet

One form, one table (`waitlist`). Fields: **email**; **what for** (`tester`, the default, and/or `updates`,
the Call Sheet: a mail whenever the plan moves a step; at least one); for testers the **platforms** they
could test on (`web`, `android`, `ios`; at least one); about you. All required.

Double opt-in: the Worker stores the row unconfirmed with a 48-hex token and sends the confirmation
link (`/api/waitlist/confirm/<token>`) through Cloudflare Email Service. The link confirms once, clears
the token, and lands on `/?confirmed=yes#waitlist` (a banner on the page); an unknown, used or older
than 7-day link lands on `/?confirmed=no#waitlist`.

The form never reveals whether an address is on the list: a confirmed address answers like a new one
(no mail); an unconfirmed one gets the mail again, with a fresh token, at most once per 10 minutes.
A failed mail keeps the row and answers 502, so the person can try again.

The admin view marks confirmed rows as invited and exports the confirmed ones as CSV (`/admin/api/waitlist.csv`).

## Feature requests

One submission carries one or many **entries**: optional title, required text, and per entry "ask me
questions while it takes shape". Then once per submission: about you (required), and an **email**,
optional, required once an entry asks for questions. No mail goes to it (it is unverified, and an
automatic mail would let anyone make the site write to any address). Without an email the submission
is anonymous.

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
