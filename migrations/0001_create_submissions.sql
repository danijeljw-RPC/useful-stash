CREATE TABLE submissions (
  id TEXT PRIMARY KEY NOT NULL,
  public_reference TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('media', 'guest', 'story')),
  subtype TEXT CHECK (subtype IS NULL OR subtype IN ('story', 'question')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'contacted', 'shortlisted', 'scheduled', 'declined', 'used', 'archived')),
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status_updated_by TEXT
);

CREATE INDEX submissions_created_at_idx ON submissions (created_at);
CREATE INDEX submissions_kind_status_created_idx ON submissions (kind, status, created_at DESC);

CREATE TABLE rate_limits (
  address_hash TEXT PRIMARY KEY NOT NULL,
  window_started_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL CHECK (attempts > 0)
);

CREATE INDEX rate_limits_window_idx ON rate_limits (window_started_at);

