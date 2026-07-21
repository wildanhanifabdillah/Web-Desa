CREATE TABLE IF NOT EXISTS potential_categories (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  label VARCHAR(120) NOT NULL,
  title VARCHAR(220) NOT NULL,
  summary TEXT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  accent_class_name VARCHAR(160) NOT NULL,
  stat_value VARCHAR(80) NOT NULL,
  stat_label VARCHAR(120) NOT NULL,
  detail_eyebrow VARCHAR(140) NOT NULL,
  detail_intro TEXT NOT NULL,
  detail_description TEXT NOT NULL,
  contact_name VARCHAR(160) NOT NULL,
  contact_role VARCHAR(160) NOT NULL,
  contact_email VARCHAR(180) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_potential_categories_active_order (is_active, display_order)
);

CREATE TABLE IF NOT EXISTS potential_items (
  id CHAR(36) PRIMARY KEY,
  category_id CHAR(36) NOT NULL,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_alt VARCHAR(220) NOT NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_potential_items_category_order (category_id, display_order),
  INDEX idx_potential_items_status_published (status, published_at),
  CONSTRAINT fk_potential_items_category
    FOREIGN KEY (category_id) REFERENCES potential_categories(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS potential_highlights (
  id CHAR(36) PRIMARY KEY,
  category_id CHAR(36) NOT NULL,
  label VARCHAR(120) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_potential_highlights_category_order (category_id, display_order),
  CONSTRAINT fk_potential_highlights_category
    FOREIGN KEY (category_id) REFERENCES potential_categories(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS potential_opportunities (
  id CHAR(36) PRIMARY KEY,
  category_id CHAR(36) NOT NULL,
  description TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_potential_opportunities_category_order (category_id, display_order),
  CONSTRAINT fk_potential_opportunities_category
    FOREIGN KEY (category_id) REFERENCES potential_categories(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS potential_programs (
  id CHAR(36) PRIMARY KEY,
  category_id CHAR(36) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_potential_programs_category_order (category_id, display_order),
  CONSTRAINT fk_potential_programs_category
    FOREIGN KEY (category_id) REFERENCES potential_categories(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS potential_gallery_items (
  id CHAR(36) PRIMARY KEY,
  category_id CHAR(36) NOT NULL,
  potential_item_id CHAR(36) NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_alt VARCHAR(220) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_potential_gallery_category_order (category_id, display_order),
  INDEX idx_potential_gallery_item (potential_item_id),
  CONSTRAINT fk_potential_gallery_category
    FOREIGN KEY (category_id) REFERENCES potential_categories(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_potential_gallery_item
    FOREIGN KEY (potential_item_id) REFERENCES potential_items(id)
    ON DELETE SET NULL
);

INSERT INTO potential_categories (
  id,
  slug,
  label,
  title,
  summary,
  image_url,
  accent_class_name,
  stat_value,
  stat_label,
  detail_eyebrow,
  detail_intro,
  detail_description,
  contact_name,
  contact_role,
  contact_email,
  display_order,
  is_active
) VALUES
(
  'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0601',
  'pertanian',
  'Pertanian',
  'Pertanian pangan dan kebun produktif',
  'Sawah, kebun sayur, dan kelompok tani menjadi penggerak utama ekonomi warga sekaligus identitas Desa Keseneng.',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85',
  'bg-sage-100 text-sage-800',
  '312 ha',
  'lahan produktif',
  'Potensi Pertanian',
  'Pertanian menjadi tulang punggung ekonomi lokal dengan lahan produktif, kelompok tani aktif, dan praktik kerja warga yang kuat.',
  'Pengembangan pertanian Desa Keseneng diarahkan pada peningkatan kualitas hasil pangan, penguatan kelembagaan kelompok tani, dan publikasi komoditas unggulan agar lebih mudah dikenali warga, mitra, dan pasar sekitar.',
  'Kelompok Tani Desa Keseneng',
  'Pengelola data pertanian',
  'pertanian@keseneng.desa.id',
  1,
  TRUE
),
(
  'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0602',
  'kesenian',
  'Kesenian',
  'Kesenian warga dan tradisi desa',
  'Kelompok seni lokal menjaga ruang latihan, pentas tahunan, dan regenerasi anak muda agar tradisi desa tetap hidup.',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=85',
  'bg-amber-100 text-amber-800',
  '5',
  'komunitas seni',
  'Potensi Kesenian',
  'Kesenian warga menjadi ruang ekspresi budaya sekaligus media regenerasi tradisi Desa Keseneng.',
  'Pengelolaan potensi kesenian diarahkan untuk mendokumentasikan kelompok seni, jadwal latihan, agenda pentas, dan cerita budaya agar identitas desa tampil lebih kuat di kanal digital.',
  'Komunitas Seni Keseneng',
  'Pengelola kegiatan budaya',
  'kesenian@keseneng.desa.id',
  2,
  TRUE
),
(
  'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0603',
  'umkm',
  'UMKM',
  'Produk lokal dan usaha warga',
  'Olahan pangan, kerajinan, dan layanan warga disiapkan untuk memperluas pasar melalui publikasi digital desa.',
  'https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?auto=format&fit=crop&w=1200&q=85',
  'bg-sky-100 text-sky-800',
  '48',
  'usaha warga',
  'Potensi UMKM',
  'UMKM warga menjadi pintu penguatan ekonomi lokal melalui produk pangan, kerajinan, dan layanan desa.',
  'Halaman detail UMKM disiapkan untuk menampung katalog produk, profil pelaku usaha, informasi kontak, dan cerita produksi agar produk lokal lebih mudah dipromosikan secara digital.',
  'Forum UMKM Desa Keseneng',
  'Pengelola data usaha warga',
  'umkm@keseneng.desa.id',
  3,
  TRUE
),
(
  'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0604',
  'peternakan',
  'Peternakan',
  'Peternakan skala warga',
  'Ternak keluarga dan kelompok kecil menjadi penopang ekonomi tambahan yang terhubung dengan kebutuhan pangan lokal.',
  'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=85',
  'bg-rose-100 text-rose-800',
  '9',
  'kelompok ternak',
  'Potensi Peternakan',
  'Peternakan warga mendukung ekonomi rumah tangga dan memperkuat siklus pangan lokal desa.',
  'Data peternakan disiapkan untuk mengenalkan kelompok ternak, jenis komoditas, kebutuhan pakan, dan peluang pengembangan usaha skala warga secara bertahap.',
  'Kelompok Ternak Keseneng',
  'Pengelola data peternakan',
  'peternakan@keseneng.desa.id',
  4,
  TRUE
)
ON DUPLICATE KEY UPDATE
  label = VALUES(label),
  title = VALUES(title),
  summary = VALUES(summary),
  image_url = VALUES(image_url),
  accent_class_name = VALUES(accent_class_name),
  stat_value = VALUES(stat_value),
  stat_label = VALUES(stat_label),
  detail_eyebrow = VALUES(detail_eyebrow),
  detail_intro = VALUES(detail_intro),
  detail_description = VALUES(detail_description),
  contact_name = VALUES(contact_name),
  contact_role = VALUES(contact_role),
  contact_email = VALUES(contact_email),
  display_order = VALUES(display_order),
  is_active = VALUES(is_active);

INSERT INTO potential_highlights (id, category_id, label, display_order) VALUES
  ('f989f3d9-927d-45f5-8c12-64fd4b8f0701', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0601', 'Padi', 1),
  ('f989f3d9-927d-45f5-8c12-64fd4b8f0702', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0601', 'Sayuran', 2),
  ('f989f3d9-927d-45f5-8c12-64fd4b8f0703', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0601', 'Kelompok tani', 3),
  ('f989f3d9-927d-45f5-8c12-64fd4b8f0704', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0602', 'Pentas budaya', 1),
  ('f989f3d9-927d-45f5-8c12-64fd4b8f0705', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0602', 'Latihan rutin', 2),
  ('f989f3d9-927d-45f5-8c12-64fd4b8f0706', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0602', 'Regenerasi', 3),
  ('f989f3d9-927d-45f5-8c12-64fd4b8f0707', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0603', 'Olahan pangan', 1),
  ('f989f3d9-927d-45f5-8c12-64fd4b8f0708', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0603', 'Kerajinan', 2),
  ('f989f3d9-927d-45f5-8c12-64fd4b8f0709', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0603', 'Katalog digital', 3),
  ('f989f3d9-927d-45f5-8c12-64fd4b8f0710', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0604', 'Kambing', 1),
  ('f989f3d9-927d-45f5-8c12-64fd4b8f0711', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0604', 'Unggas', 2),
  ('f989f3d9-927d-45f5-8c12-64fd4b8f0712', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0604', 'Pakan lokal', 3)
ON DUPLICATE KEY UPDATE
  label = VALUES(label),
  display_order = VALUES(display_order);

INSERT INTO potential_items (id, category_id, title, slug, summary, description, image_url, image_alt, status, published_at, display_order) VALUES
  ('cbef4cf6-4f02-4b88-9d5b-483d3b4f0801', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0601', 'Hamparan sawah produktif', 'hamparan-sawah-produktif', 'Area pertanian warga yang menjadi sumber pangan utama.', 'Area pertanian warga yang menjadi sumber pangan utama dan potensi utama Desa Keseneng.', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80', 'Hamparan sawah produktif Desa Keseneng', 'published', '2026-07-10 08:00:00', 1),
  ('cbef4cf6-4f02-4b88-9d5b-483d3b4f0802', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0602', 'Latihan seni warga', 'latihan-seni-warga', 'Ruang latihan menjadi tempat regenerasi kelompok seni desa.', 'Ruang latihan seni warga menjadi pusat regenerasi kelompok seni desa.', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80', 'Latihan seni warga Desa Keseneng', 'published', '2026-07-10 09:00:00', 1),
  ('cbef4cf6-4f02-4b88-9d5b-483d3b4f0803', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0603', 'Produk olahan pangan', 'produk-olahan-pangan', 'Produk warga disiapkan untuk katalog dan kanal penjualan.', 'Produk olahan pangan warga disiapkan untuk katalog digital dan kanal promosi desa.', 'https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?auto=format&fit=crop&w=900&q=80', 'Produk olahan pangan warga', 'published', '2026-07-10 10:00:00', 1),
  ('cbef4cf6-4f02-4b88-9d5b-483d3b4f0804', 'b1c7c2dd-8f56-4b46-8d8a-8c1f701c0604', 'Ternak keluarga', 'ternak-keluarga', 'Peternakan skala rumah tangga mendukung pendapatan warga.', 'Peternakan skala rumah tangga menjadi penopang tambahan ekonomi warga.', 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=900&q=80', 'Ternak keluarga warga desa', 'published', '2026-07-10 11:00:00', 1)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  title = VALUES(title),
  summary = VALUES(summary),
  description = VALUES(description),
  image_url = VALUES(image_url),
  image_alt = VALUES(image_alt),
  status = VALUES(status),
  published_at = VALUES(published_at),
  display_order = VALUES(display_order);
