-- Seeder item contoh Potensi Desa Keseneng.
-- Jalankan setelah seeder kategori potensi.
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

