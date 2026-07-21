-- Seeder data berita untuk pengembangan Desa Keseneng.
-- Jalankan setelah migration 003_create_berita.sql.
INSERT INTO berita (
  id,
  title,
  slug,
  excerpt,
  content,
  cover_image_url,
  cover_image_alt,
  category,
  author_name,
  is_ai_generated,
  status,
  published_at
) VALUES
(
  '1b3f4e8c-5e2a-46f6-bb25-0be4c7c8d901',
  'Warga Desa Keseneng Rawat Tradisi Gotong Royong Panen',
  'warga-desa-keseneng-rawat-tradisi-gotong-royong-panen',
  'Kegiatan panen bersama menjadi ruang warga memperkuat kerja sama sekaligus menjaga produktivitas lahan pertanian desa.',
  'Kegiatan panen bersama di Desa Keseneng memperlihatkan kuatnya tradisi gotong royong masyarakat dalam menjaga produktivitas lahan pertanian dan hubungan sosial antarwarga.',
  '/images/berita/gotong-royong-panen.jpg',
  'Warga Desa Keseneng bergotong royong saat kegiatan panen',
  'Pertanian',
  'Admin Desa Keseneng',
  FALSE,
  'published',
  '2026-07-01 08:00:00'
),
(
  'd8c2c8b7-a7d4-4d79-9f52-5e0f3439bb12',
  'Kelompok Seni Desa Siapkan Pentas Budaya Tahunan',
  'kelompok-seni-desa-siapkan-pentas-budaya-tahunan',
  'Latihan rutin kelompok seni desa terus dilakukan sebagai persiapan pentas budaya yang melibatkan generasi muda.',
  'Kelompok seni Desa Keseneng menggelar latihan rutin untuk mempersiapkan pentas budaya tahunan yang menjadi ruang regenerasi pelaku seni lokal.',
  '/images/berita/pentas-budaya.jpg',
  'Kelompok seni Desa Keseneng berlatih untuk pentas budaya',
  'Kesenian',
  'Admin Desa Keseneng',
  FALSE,
  'published',
  '2026-06-24 09:00:00'
),
(
  'a64e2735-3a4e-4d97-908a-ec4f21ad7306',
  'Pemerintah Desa Buka Akses Informasi Publik Digital',
  'pemerintah-desa-buka-akses-informasi-publik-digital',
  'Informasi desa, dokumen publik, dan kabar kegiatan disiapkan agar warga lebih mudah mengikuti perkembangan desa.',
  'Pemerintah Desa Keseneng menyiapkan kanal informasi publik digital untuk memudahkan warga mengakses kabar kegiatan, dokumen, dan layanan informasi desa.',
  '/images/berita/informasi-publik.jpg',
  'Perangkat Desa Keseneng menyiapkan informasi publik digital',
  'Informasi Publik',
  'Admin Desa Keseneng',
  FALSE,
  'published',
  '2026-06-18 10:00:00'
)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  excerpt = VALUES(excerpt),
  content = VALUES(content),
  cover_image_url = VALUES(cover_image_url),
  cover_image_alt = VALUES(cover_image_alt),
  category = VALUES(category),
  author_name = VALUES(author_name),
  is_ai_generated = VALUES(is_ai_generated),
  status = VALUES(status),
  published_at = VALUES(published_at);

