CREATE TABLE IF NOT EXISTS data_statistik (
  id CHAR(36) PRIMARY KEY,
  category VARCHAR(120) NOT NULL,
  label VARCHAR(120) NOT NULL,
  value_number INT NOT NULL,
  unit VARCHAR(40) NOT NULL DEFAULT 'orang',
  description VARCHAR(220) NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_data_statistik_featured_order (is_featured, display_order),
  INDEX idx_data_statistik_category_order (category, display_order)
);

INSERT INTO data_statistik (
  id,
  category,
  label,
  value_number,
  unit,
  description,
  display_order,
  is_featured
) VALUES
(
  '7fb974d5-8f94-4df6-98f0-1038f4fc5f5a',
  'Kependudukan',
  'Penduduk',
  4210,
  'jiwa',
  'Estimasi jumlah penduduk Desa Keseneng',
  1,
  TRUE
),
(
  '2df89b48-25f5-47db-8c0e-84b4c9ce7a01',
  'Kewilayahan',
  'Dusun',
  6,
  'dusun',
  'Wilayah administrasi dusun di Desa Keseneng',
  2,
  TRUE
),
(
  '9f3f0c67-5715-4d11-87c3-91c44f323891',
  'Potensi',
  'Kelompok Tani',
  14,
  'kelompok',
  'Kelompok tani aktif yang mendukung potensi pertanian desa',
  3,
  TRUE
),
(
  '60401a93-cc5a-428d-a1d1-2791cbf4471d',
  'Kesenian',
  'Kelompok Seni',
  5,
  'kelompok',
  'Kelompok seni dan budaya lokal yang aktif berkegiatan',
  4,
  TRUE
)
ON DUPLICATE KEY UPDATE
  category = VALUES(category),
  label = VALUES(label),
  value_number = VALUES(value_number),
  unit = VALUES(unit),
  description = VALUES(description),
  display_order = VALUES(display_order),
  is_featured = VALUES(is_featured);
