ALTER TABLE audit_log ADD COLUMN restored_at TEXT;
ALTER TABLE audit_log ADD COLUMN restored_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE audit_log ADD COLUMN restored_from_json TEXT;
