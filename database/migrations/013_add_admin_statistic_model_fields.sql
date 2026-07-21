ALTER TABLE data_statistik
  ADD COLUMN slug VARCHAR(140) NULL AFTER id,
  ADD COLUMN status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published' AFTER is_featured,
  ADD COLUMN source_name VARCHAR(160) NULL AFTER status,
  ADD COLUMN period_label VARCHAR(80) NULL AFTER source_name,
  ADD COLUMN published_at DATETIME NULL AFTER period_label,
  ADD COLUMN created_by CHAR(36) NULL AFTER published_at,
  ADD COLUMN updated_by CHAR(36) NULL AFTER created_by;

UPDATE data_statistik
SET slug = LOWER(REPLACE(REPLACE(label, '/', '-'), ' ', '-'))
WHERE slug IS NULL;

ALTER TABLE data_statistik
  MODIFY slug VARCHAR(140) NOT NULL,
  ADD UNIQUE KEY uq_data_statistik_slug (slug),
  ADD INDEX idx_data_statistik_status_order (status, display_order),
  ADD INDEX idx_data_statistik_period (period_label),
  ADD CONSTRAINT fk_data_statistik_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
    ON DELETE SET NULL,
  ADD CONSTRAINT fk_data_statistik_updated_by
    FOREIGN KEY (updated_by) REFERENCES admin_users(id)
    ON DELETE SET NULL;

ALTER TABLE statistic_sections
  ADD COLUMN published_at DATETIME NULL AFTER status,
  ADD COLUMN created_by CHAR(36) NULL AFTER published_at,
  ADD COLUMN updated_by CHAR(36) NULL AFTER created_by,
  ADD INDEX idx_statistic_sections_source_period (source_name, period_label),
  ADD CONSTRAINT fk_statistic_sections_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
    ON DELETE SET NULL,
  ADD CONSTRAINT fk_statistic_sections_updated_by
    FOREIGN KEY (updated_by) REFERENCES admin_users(id)
    ON DELETE SET NULL;

ALTER TABLE statistic_chart_items
  ADD COLUMN source_note VARCHAR(220) NULL AFTER color_token,
  ADD COLUMN created_by CHAR(36) NULL AFTER display_order,
  ADD COLUMN updated_by CHAR(36) NULL AFTER created_by,
  ADD CONSTRAINT fk_statistic_chart_items_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
    ON DELETE SET NULL,
  ADD CONSTRAINT fk_statistic_chart_items_updated_by
    FOREIGN KEY (updated_by) REFERENCES admin_users(id)
    ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS statistic_change_logs (
  id CHAR(36) PRIMARY KEY,
  entity_table VARCHAR(120) NOT NULL,
  entity_id CHAR(36) NOT NULL,
  action ENUM('create', 'update', 'publish', 'archive', 'delete') NOT NULL,
  change_note TEXT NULL,
  before_data JSON NULL,
  after_data JSON NULL,
  created_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_statistic_change_logs_entity (entity_table, entity_id),
  INDEX idx_statistic_change_logs_action_created (action, created_at),
  CONSTRAINT fk_statistic_change_logs_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
    ON DELETE SET NULL
);