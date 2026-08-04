UPDATE data_statistik
SET is_featured = FALSE,
    status = 'archived'
WHERE slug = 'kelompok-tani'
   OR label = 'Kelompok Tani';

INSERT INTO data_statistik (
  id,
  slug,
  category,
  label,
  value_number,
  unit,
  description,
  display_order,
  is_featured,
  status,
  source_name,
  period_label
) VALUES (
  'df56c9a1-5f26-4c27-b4f8-5e9cb8b21c11',
  'rt-rw',
  'Kewilayahan',
  'RT/RW',
  34,
  'unit',
  'Gabungan unit RT dan RW dalam struktur kewilayahan desa.',
  4,
  TRUE,
  'published',
  'Data Desa Keseneng',
  '2026'
)
ON DUPLICATE KEY UPDATE
  category = VALUES(category),
  label = VALUES(label),
  value_number = VALUES(value_number),
  unit = VALUES(unit),
  description = VALUES(description),
  display_order = VALUES(display_order),
  is_featured = VALUES(is_featured),
  status = VALUES(status),
  source_name = VALUES(source_name),
  period_label = VALUES(period_label);

UPDATE data_statistik
SET is_featured = FALSE
WHERE slug NOT IN ('penduduk', 'kepala-keluarga', 'dusun', 'rt-rw');