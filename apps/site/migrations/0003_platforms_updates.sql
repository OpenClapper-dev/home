-- The roadmap (page section "Plan ahead"): a sign-up is a tester (picked at step 5), a Call Sheet
-- subscriber (a mail when the roadmap moves), or both; testers say which platforms they can test on.
-- Feature requests carry the platforms too, for entries that ask to test. JSON lists of platform ids
-- (packages/vocab: web | android | ios).
ALTER TABLE waitlist ADD COLUMN tester INTEGER NOT NULL DEFAULT 1;
ALTER TABLE waitlist ADD COLUMN updates INTEGER NOT NULL DEFAULT 0;
ALTER TABLE waitlist ADD COLUMN platforms TEXT NOT NULL DEFAULT '[]';
ALTER TABLE requests ADD COLUMN platforms TEXT NOT NULL DEFAULT '[]';
