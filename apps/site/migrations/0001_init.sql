-- The waiting list for the hosted version. A row is created unconfirmed with a one-time token; the
-- confirmation link sets confirmed_at and clears the token. The email is unique, case-insensitively.
CREATE TABLE waitlist (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  nickname TEXT,
  positions TEXT NOT NULL DEFAULT '[]',   -- JSON list of position ids (packages/vocab)
  other_position TEXT,
  years INTEGER,
  created_at TEXT NOT NULL,
  confirmed_at TEXT,
  token TEXT UNIQUE,                       -- confirmation token; NULL once confirmed
  token_sent_at TEXT,                      -- when the last confirmation mail went out
  invited_at TEXT                          -- set by the owner once an invite went out
);

-- One feature-request submission: the person once, the requests as entries.
CREATE TABLE requests (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  positions TEXT NOT NULL DEFAULT '[]',
  other_position TEXT,
  years INTEGER,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'new'       -- new | seen | done
);

CREATE TABLE request_entries (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,               -- order within the submission
  title TEXT,
  text TEXT NOT NULL,
  test INTEGER NOT NULL DEFAULT 0,         -- willing to test this feature
  prototype INTEGER NOT NULL DEFAULT 0     -- willing to be contacted while it is shaped
);
CREATE INDEX request_entries_request ON request_entries(request_id, position);
