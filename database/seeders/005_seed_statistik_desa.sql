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
  ('7fb974d5-8f94-4df6-98f0-1038f4fc5f5a', 'Kependudukan', 'Penduduk', 4210, 'jiwa', 'Estimasi jumlah penduduk yang tercatat dalam data awal desa.', 1, TRUE),
  ('d7c78c32-1e85-4f17-92e2-2a697d8a1b01', 'Kependudukan', 'Kepala Keluarga', 1286, 'KK', 'Jumlah kepala keluarga sebagai basis layanan administrasi.', 2, TRUE),
  ('2df89b48-25f5-47db-8c0e-84b4c9ce7a01', 'Kewilayahan', 'Dusun', 6, 'dusun', 'Wilayah dusun yang menjadi cakupan pelayanan Desa Keseneng.', 3, TRUE),
  ('df56c9a1-5f26-4c27-b4f8-5e9cb8b21c11', 'Kewilayahan', 'RT/RW', 34, 'unit', 'Gabungan unit RT dan RW dalam struktur kewilayahan desa.', 4, TRUE)
ON DUPLICATE KEY UPDATE
  category = VALUES(category),
  label = VALUES(label),
  value_number = VALUES(value_number),
  unit = VALUES(unit),
  description = VALUES(description),
  display_order = VALUES(display_order),
  is_featured = VALUES(is_featured);

INSERT INTO statistic_sections (
  id,
  slug,
  title,
  description,
  total_label,
  total_value,
  unit,
  chart_type,
  source_name,
  period_label,
  display_order,
  status
) VALUES
  ('b201f79c-74d7-49e2-b3a8-7104229e1001', 'usia', 'Komposisi Usia', 'Sebaran penduduk berdasarkan kelompok usia untuk membantu membaca kebutuhan layanan pendidikan, produktivitas, dan sosial.', 'Total penduduk', 4210, 'jiwa', 'bar', 'Data awal Desa Keseneng', '2026', 1, 'published'),
  ('b201f79c-74d7-49e2-b3a8-7104229e1002', 'pendidikan', 'Tingkat Pendidikan', 'Data tiruan tingkat pendidikan warga sebagai gambaran awal kebutuhan program literasi dan pelatihan.', 'Warga terdata', 3510, 'orang', 'bar', 'Data awal Desa Keseneng', '2026', 2, 'published'),
  ('b201f79c-74d7-49e2-b3a8-7104229e1003', 'pekerjaan', 'Mata Pencaharian', 'Sebaran pekerjaan utama warga yang mendukung arah pengembangan ekonomi dan potensi desa.', 'Warga bekerja', 2460, 'orang', 'bar', 'Data awal Desa Keseneng', '2026', 3, 'published')
ON DUPLICATE KEY UPDATE
  slug = VALUES(slug),
  title = VALUES(title),
  description = VALUES(description),
  total_label = VALUES(total_label),
  total_value = VALUES(total_value),
  unit = VALUES(unit),
  chart_type = VALUES(chart_type),
  source_name = VALUES(source_name),
  period_label = VALUES(period_label),
  display_order = VALUES(display_order),
  status = VALUES(status);

INSERT INTO statistic_chart_items (
  id,
  section_id,
  label,
  value_number,
  color_token,
  display_order
) VALUES
  ('c301f79c-74d7-49e2-b3a8-7104229e1001', 'b201f79c-74d7-49e2-b3a8-7104229e1001', '0-14 tahun', 842, 'bg-sage-600', 1),
  ('c301f79c-74d7-49e2-b3a8-7104229e1002', 'b201f79c-74d7-49e2-b3a8-7104229e1001', '15-24 tahun', 694, 'bg-emerald-500', 2),
  ('c301f79c-74d7-49e2-b3a8-7104229e1003', 'b201f79c-74d7-49e2-b3a8-7104229e1001', '25-54 tahun', 1845, 'bg-sky-500', 3),
  ('c301f79c-74d7-49e2-b3a8-7104229e1004', 'b201f79c-74d7-49e2-b3a8-7104229e1001', '55+ tahun', 829, 'bg-amber-500', 4),
  ('c301f79c-74d7-49e2-b3a8-7104229e1005', 'b201f79c-74d7-49e2-b3a8-7104229e1002', 'SD/sederajat', 1180, 'bg-sage-600', 1),
  ('c301f79c-74d7-49e2-b3a8-7104229e1006', 'b201f79c-74d7-49e2-b3a8-7104229e1002', 'SMP/sederajat', 875, 'bg-emerald-500', 2),
  ('c301f79c-74d7-49e2-b3a8-7104229e1007', 'b201f79c-74d7-49e2-b3a8-7104229e1002', 'SMA/sederajat', 1025, 'bg-sky-500', 3),
  ('c301f79c-74d7-49e2-b3a8-7104229e1008', 'b201f79c-74d7-49e2-b3a8-7104229e1002', 'Perguruan tinggi', 430, 'bg-indigo-500', 4),
  ('c301f79c-74d7-49e2-b3a8-7104229e1009', 'b201f79c-74d7-49e2-b3a8-7104229e1003', 'Petani', 980, 'bg-sage-600', 1),
  ('c301f79c-74d7-49e2-b3a8-7104229e1010', 'b201f79c-74d7-49e2-b3a8-7104229e1003', 'Wiraswasta/UMKM', 520, 'bg-emerald-500', 2),
  ('c301f79c-74d7-49e2-b3a8-7104229e1011', 'b201f79c-74d7-49e2-b3a8-7104229e1003', 'Buruh', 610, 'bg-orange-500', 3),
  ('c301f79c-74d7-49e2-b3a8-7104229e1012', 'b201f79c-74d7-49e2-b3a8-7104229e1003', 'PNS/karyawan', 350, 'bg-sky-500', 4)
ON DUPLICATE KEY UPDATE
  section_id = VALUES(section_id),
  label = VALUES(label),
  value_number = VALUES(value_number),
  color_token = VALUES(color_token),
  display_order = VALUES(display_order);
