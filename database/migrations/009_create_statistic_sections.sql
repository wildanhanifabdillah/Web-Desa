CREATE TABLE IF NOT EXISTS statistic_sections (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  total_label VARCHAR(120) NOT NULL,
  total_value INT NOT NULL DEFAULT 0,
  unit VARCHAR(40) NOT NULL DEFAULT 'orang',
  chart_type ENUM('bar', 'pie', 'line') NOT NULL DEFAULT 'bar',
  source_name VARCHAR(160) NULL,
  period_label VARCHAR(80) NULL,
  display_order INT NOT NULL DEFAULT 0,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_statistic_sections_status_order (status, display_order),
  INDEX idx_statistic_sections_period (period_label)
);

CREATE TABLE IF NOT EXISTS statistic_chart_items (
  id CHAR(36) PRIMARY KEY,
  section_id CHAR(36) NOT NULL,
  label VARCHAR(140) NOT NULL,
  value_number INT NOT NULL DEFAULT 0,
  color_token VARCHAR(80) NOT NULL DEFAULT 'bg-sage-600',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_statistic_chart_items_section_order (section_id, display_order),
  CONSTRAINT fk_statistic_chart_items_section
    FOREIGN KEY (section_id) REFERENCES statistic_sections(id)
    ON DELETE CASCADE
);
