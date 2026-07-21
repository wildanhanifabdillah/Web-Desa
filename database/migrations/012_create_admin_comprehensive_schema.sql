CREATE TABLE IF NOT EXISTS admin_roles (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_users_status (status)
);

CREATE TABLE IF NOT EXISTS admin_user_roles (
  user_id CHAR(36) NOT NULL,
  role_id CHAR(36) NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_admin_user_roles_user
    FOREIGN KEY (user_id) REFERENCES admin_users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_admin_user_roles_role
    FOREIGN KEY (role_id) REFERENCES admin_roles(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_sessions_user_expires (user_id, expires_at),
  CONSTRAINT fk_admin_sessions_user
    FOREIGN KEY (user_id) REFERENCES admin_users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_content_blocks (
  id CHAR(36) PRIMARY KEY,
  section VARCHAR(120) NOT NULL,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  body LONGTEXT NOT NULL,
  metadata JSON NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  display_order INT NOT NULL DEFAULT 0,
  published_at DATETIME NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_content_section_status_order (section, status, display_order),
  INDEX idx_admin_content_published_at (published_at),
  CONSTRAINT fk_admin_content_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_admin_content_updated_by
    FOREIGN KEY (updated_by) REFERENCES admin_users(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_media_assets (
  id CHAR(36) PRIMARY KEY,
  file_name VARCHAR(220) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  alt_text VARCHAR(220) NULL,
  caption TEXT NULL,
  usage_scope VARCHAR(120) NOT NULL DEFAULT 'general',
  uploaded_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_media_scope_created (usage_scope, created_at),
  CONSTRAINT fk_admin_media_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES admin_users(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_ai_drafts (
  id CHAR(36) PRIMARY KEY,
  module VARCHAR(120) NOT NULL,
  prompt TEXT NOT NULL,
  generated_title VARCHAR(220) NULL,
  generated_body LONGTEXT NOT NULL,
  status ENUM('generated', 'reviewed', 'accepted', 'rejected') NOT NULL DEFAULT 'generated',
  target_table VARCHAR(120) NULL,
  target_id CHAR(36) NULL,
  created_by CHAR(36) NULL,
  reviewed_by CHAR(36) NULL,
  reviewed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_ai_module_status (module, status),
  INDEX idx_admin_ai_target (target_table, target_id),
  CONSTRAINT fk_admin_ai_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_admin_ai_reviewed_by
    FOREIGN KEY (reviewed_by) REFERENCES admin_users(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_content_revisions (
  id CHAR(36) PRIMARY KEY,
  entity_table VARCHAR(120) NOT NULL,
  entity_id CHAR(36) NOT NULL,
  revision_number INT NOT NULL,
  snapshot JSON NOT NULL,
  change_note TEXT NULL,
  created_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_content_revision (entity_table, entity_id, revision_number),
  INDEX idx_admin_content_revisions_entity (entity_table, entity_id),
  CONSTRAINT fk_admin_content_revisions_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_site_settings (
  setting_key VARCHAR(120) PRIMARY KEY,
  setting_value JSON NOT NULL,
  description TEXT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_site_settings_public (is_public),
  CONSTRAINT fk_admin_site_settings_updated_by
    FOREIGN KEY (updated_by) REFERENCES admin_users(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NULL,
  action VARCHAR(120) NOT NULL,
  entity_table VARCHAR(120) NOT NULL,
  entity_id CHAR(36) NULL,
  before_data JSON NULL,
  after_data JSON NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_audit_user_created (user_id, created_at),
  INDEX idx_admin_audit_entity (entity_table, entity_id),
  INDEX idx_admin_audit_action_created (action, created_at),
  CONSTRAINT fk_admin_audit_user
    FOREIGN KEY (user_id) REFERENCES admin_users(id)
    ON DELETE SET NULL
);

INSERT INTO admin_roles (id, name, description) VALUES
  ('8f6d9f84-4a52-4d6b-8a57-100000000001', 'super_admin', 'Akses penuh seluruh modul admin desa'),
  ('8f6d9f84-4a52-4d6b-8a57-100000000002', 'editor', 'Mengelola konten, berita, galeri, dan dokumen'),
  ('8f6d9f84-4a52-4d6b-8a57-100000000003', 'viewer', 'Melihat data admin tanpa hak perubahan')
ON DUPLICATE KEY UPDATE
  description = VALUES(description);

INSERT INTO admin_site_settings (setting_key, setting_value, description, is_public) VALUES
  ('site_identity', JSON_OBJECT('name', 'Desa Keseneng Digital', 'shortName', 'Desa Keseneng'), 'Identitas publik website desa', TRUE),
  ('admin_modules', JSON_ARRAY('konten', 'perangkat', 'berita', 'statistik', 'potensi', 'transparansi'), 'Daftar modul aktif pada dashboard admin', FALSE),
  ('content_workflow', JSON_OBJECT('defaultStatus', 'draft', 'requiresPreview', true), 'Aturan dasar publikasi konten admin', FALSE)
ON DUPLICATE KEY UPDATE
  setting_value = VALUES(setting_value),
  description = VALUES(description),
  is_public = VALUES(is_public);
