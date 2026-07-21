ALTER TABLE potential_items
  ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE AFTER status,
  ADD COLUMN seo_title VARCHAR(220) NULL AFTER image_alt,
  ADD COLUMN seo_description VARCHAR(320) NULL AFTER seo_title,
  ADD COLUMN contact_name VARCHAR(160) NULL AFTER published_at,
  ADD COLUMN contact_role VARCHAR(160) NULL AFTER contact_name,
  ADD COLUMN contact_email VARCHAR(180) NULL AFTER contact_role,
  ADD COLUMN created_by CHAR(36) NULL AFTER display_order,
  ADD COLUMN updated_by CHAR(36) NULL AFTER created_by,
  ADD INDEX idx_potential_items_featured_order (is_featured, display_order),
  ADD INDEX idx_potential_items_category_status_order (category_id, status, display_order),
  ADD CONSTRAINT fk_potential_items_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
    ON DELETE SET NULL,
  ADD CONSTRAINT fk_potential_items_updated_by
    FOREIGN KEY (updated_by) REFERENCES admin_users(id)
    ON DELETE SET NULL;

UPDATE potential_items
SET
  seo_title = COALESCE(seo_title, title),
  seo_description = COALESCE(seo_description, LEFT(summary, 320))
WHERE seo_title IS NULL OR seo_description IS NULL;

CREATE TABLE IF NOT EXISTS potential_item_change_logs (
  id CHAR(36) PRIMARY KEY,
  item_id CHAR(36) NULL,
  category_id CHAR(36) NULL,
  action ENUM('create', 'update', 'publish', 'archive', 'delete') NOT NULL,
  change_note TEXT NULL,
  before_data JSON NULL,
  after_data JSON NULL,
  created_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_potential_item_logs_item (item_id, created_at),
  INDEX idx_potential_item_logs_category (category_id, created_at),
  INDEX idx_potential_item_logs_action_created (action, created_at),
  CONSTRAINT fk_potential_item_logs_item
    FOREIGN KEY (item_id) REFERENCES potential_items(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_potential_item_logs_category
    FOREIGN KEY (category_id) REFERENCES potential_categories(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_potential_item_logs_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
    ON DELETE SET NULL
);