CREATE TABLE IF NOT EXISTS group_access (
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (group_id, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE sync_changes ADD COLUMN group_id TEXT;

CREATE INDEX IF NOT EXISTS idx_group_access_user ON group_access(user_id, group_id);
CREATE INDEX IF NOT EXISTS idx_sync_changes_group_cursor ON sync_changes(group_id, id);
