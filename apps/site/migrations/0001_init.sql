-- Both forms carry the same required about-you block, so the owner can see which direction input
-- comes from: systems, positions, years (a band) and languages are JSON lists of ids / an id from
-- packages/vocab. No name is asked anywhere.

-- The sign-up: the tester waiting list (picked at the plan's step five), the Call Sheet (a mail when
-- the plan moves a step), or both. A row is created unconfirmed with a one-time token; the confirmation
-- link sets confirmed_at and clears the token. The email is unique, case-insensitively.
CREATE TABLE waitlist (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  tester INTEGER NOT NULL DEFAULT 1,       -- wants to be considered as an alpha tester
  updates INTEGER NOT NULL DEFAULT 0,      -- wants the Call Sheet
  platforms TEXT NOT NULL DEFAULT '[]',    -- what a tester could test on (web | android | ios)
  systems TEXT NOT NULL DEFAULT '[]',      -- film systems worked in (german | us | other)
  positions TEXT NOT NULL DEFAULT '[]',    -- position ids
  other_position TEXT,                     -- what "other" is, when picked
  years TEXT NOT NULL,                     -- years in the industry, a band (lt1 | 1-3 | 3-6 | 6-9 | 9-12 | 12+)
  languages TEXT NOT NULL DEFAULT '[]',    -- languages to test in (german | english | other)
  other_language TEXT,                     -- which language "other" is, when picked
  created_at TEXT NOT NULL,
  confirmed_at TEXT,
  token TEXT UNIQUE,                       -- confirmation token; NULL once confirmed
  token_sent_at TEXT,                      -- when the last confirmation mail went out
  invited_at TEXT                          -- set by the owner once an invite went out
);

-- One feature-request submission: the person once, the requests as entries. The email is optional
-- (required once an entry asks for questions). No mail goes to it: it is unverified.
CREATE TABLE requests (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  email TEXT,
  systems TEXT NOT NULL DEFAULT '[]',
  positions TEXT NOT NULL DEFAULT '[]',
  other_position TEXT,
  years TEXT NOT NULL,
  languages TEXT NOT NULL DEFAULT '[]',
  other_language TEXT,
  status TEXT NOT NULL DEFAULT 'new'       -- new | seen | done
);

CREATE TABLE request_entries (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,               -- order within the submission
  title TEXT,
  text TEXT NOT NULL,
  prototype INTEGER NOT NULL DEFAULT 0     -- would answer questions while it takes shape
);
CREATE INDEX request_entries_request ON request_entries(request_id, position);
