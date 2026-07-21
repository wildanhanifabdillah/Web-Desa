ALTER TABLE potential_categories
  ADD COLUMN status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published' AFTER is_active,
  ADD COLUMN seo_title VARCHAR(220) NULL AFTER status,
  ADD COLUMN seo_description VARCHAR(320) NULL AFTER seo_title,
  ADD COLUMN published_at DATETIME NULL AFTER seo_description,
  ADD COLUMN created_by CHAR(36) NULL AFTER published_at,
  ADD COLUMN updated_by CHAR(36) NULL AFTER created_by,
  ADD INDEX idx_potential_categories_status_order (status, display_order),
  ADD INDEX idx_potential_categories_published_at (published_at),
  ADD CONSTRAINT fk_potential_categories_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
    ON DELETE SET NULL,
  ADD CONSTRAINT fk_potential_categories_updated_by
    FOREIGN KEY (updated_by) REFERENCES admin_users(id)
    ON DELETE SET NULL;

UPDATE potential_categories
SET
  seo_title = COALESCE(seo_title, title),
  seo_description = COALESCE(seo_description, LEFT(summary, 320)),
  published_at = COALESCE(published_at, CURRENT_TIMESTAMP)
WHERE status = 'published';

CREATE TABLE IF NOT EXISTS potential_category_change_logs (
  id CHAR(36) PRIMARY KEY,
  category_id CHAR(36) NULL,
  action ENUM('create', 'update', 'publish', 'archive', 'delete') NOT NULL,
  change_note TEXT NULL,
  before_data JSON NULL,
  after_data JSON NULL,
  created_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_potential_category_logs_category (category_id, created_at),
  INDEX idx_potential_category_logs_action_created (action, created_at),
  CONSTRAINT fk_potential_category_logs_category
    FOREIGN KEY (category_id) REFERENCES potential_categories(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_potential_category_logs_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
    ON DELETE SET NULL
);