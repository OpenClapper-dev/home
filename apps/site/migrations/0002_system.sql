-- Which film system the person worked in (german | us | other), optional, both forms.
ALTER TABLE waitlist ADD COLUMN system TEXT;
ALTER TABLE requests ADD COLUMN system TEXT;
