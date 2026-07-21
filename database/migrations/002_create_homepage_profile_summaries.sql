CREATE TABLE IF NOT EXISTS homepage_profile_summaries (
  id CHAR(36) PRIMARY KEY,
  heading VARCHAR(180) NOT NULL,
  body TEXT NOT NULL,
  village_name VARCHAR(120) NOT NULL,
  district VARCHAR(120) NOT NULL,
  regency VARCHAR(120) NOT NULL,
  province VARCHAR(120) NOT NULL,
  highlight_label VARCHAR(120) NOT NULL,
  highlight_value VARCHAR(120) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_homepage_profile_summaries_active_order (is_active, display_order)
);

INSERT INTO homepage_profile_summaries (
  id,
  heading,
  body,
  village_name,
  district,
  regency,
  province,
  highlight_label,
  highlight_value,
  is_active,
  display_order
) VALUES (
  '70a7abf2-51df-4d6b-9966-0a6d3ec5120b',
  'Desa Keseneng, ruang tumbuh warga dan potensi lokal',
  'Desa Keseneng dikenal sebagai desa dengan kekuatan gotong royong, lahan pertanian produktif, dan kekayaan seni budaya yang terus dirawat oleh masyarakat.',
  'Desa Keseneng',
  'Mojotengah',
  'Wonosobo',
  'Jawa Tengah',
  'Fokus unggulan',
  'Pertanian dan kesenian',
  TRUE,
  1
) ON DUPLICATE KEY UPDATE
  heading = VALUES(heading),
  body = VALUES(body),
  village_name = VALUES(village_name),
  district = VALUES(district),
  regency = VALUES(regency),
  province = VALUES(province),
  highlight_label = VALUES(highlight_label),
  highlight_value = VALUES(highlight_value),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);
