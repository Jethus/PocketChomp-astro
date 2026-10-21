-- Store and restaurant requests sent from the /database page. Only the text
-- and the time are kept: no email, name or IP address.
CREATE TABLE food_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  text TEXT NOT NULL
);

CREATE INDEX food_requests_created_at ON food_requests (created_at);
