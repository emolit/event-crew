CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'editor')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,
  ip_hash TEXT,
  user_agent TEXT
);
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type = 'image/webp'),
  width INTEGER NOT NULL CHECK (width > 0),
  height INTEGER NOT NULL CHECK (height > 0),
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  profile TEXT NOT NULL CHECK (profile IN ('project', 'personnel', 'hero', 'client')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('staged', 'active', 'orphaned')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  roles_json TEXT NOT NULL DEFAULT '[]',
  detail_title TEXT,
  description TEXT,
  size TEXT NOT NULL DEFAULT 'standard' CHECK (size IN ('standard', 'wide', 'tall')),
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);
CREATE UNIQUE INDEX projects_active_sort_order_idx ON projects(sort_order) WHERE deleted_at IS NULL;

CREATE TABLE project_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES media_assets(id),
  alt TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);
CREATE UNIQUE INDEX project_images_active_order_idx ON project_images(project_id, sort_order) WHERE deleted_at IS NULL;

CREATE TABLE personnel (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  media_id TEXT REFERENCES media_assets(id),
  alt TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);
CREATE UNIQUE INDEX personnel_active_sort_order_idx ON personnel(sort_order) WHERE deleted_at IS NULL;

CREATE TABLE site_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  eyebrow TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  primary_button_text TEXT NOT NULL,
  primary_button_href TEXT NOT NULL,
  secondary_button_text TEXT NOT NULL,
  secondary_button_href TEXT NOT NULL,
  hero_media_id TEXT REFERENCES media_assets(id),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE footer_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  contacts_json TEXT NOT NULL,
  promotion_json TEXT NOT NULL,
  copyright_text TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  media_id TEXT NOT NULL REFERENCES media_assets(id),
  alt TEXT NOT NULL,
  website_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
  is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);
CREATE UNIQUE INDEX clients_active_sort_order_idx ON clients(sort_order) WHERE deleted_at IS NULL;

CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'reorder', 'restore')),
  before_json TEXT,
  after_json TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX audit_log_entity_idx ON audit_log(entity_type, entity_id, created_at DESC);
CREATE INDEX audit_log_created_at_idx ON audit_log(created_at DESC);
