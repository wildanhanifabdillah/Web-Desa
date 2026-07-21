-- Seeder data awal Profil Desa Keseneng.
-- Jalankan setelah migration 005_create_profile_desa.sql.
INSERT INTO village_profiles (
  id,
  slug,
  village_name,
  hero_eyebrow,
  hero_title,
  hero_description,
  overview_kicker,
  overview_title,
  overview_description,
  overview_body,
  history_kicker,
  history_title,
  history_description,
  geography_kicker,
  geography_title,
  geography_description,
  vision_label,
  vision_title,
  vision_description,
  is_active
) VALUES (
  '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01',
  'desa-keseneng',
  'Desa Keseneng',
  'Profil Desa',
  'Mengenal Desa Keseneng, desa agraris dengan tradisi yang hidup.',
  'Halaman profil menyajikan gambaran umum, sejarah, visi misi, geografis, dan perangkat Desa Keseneng sebagai dasar informasi publik untuk warga dan pengunjung.',
  'Gambaran Umum',
  'Desa yang bergerak dengan kekuatan warga dan potensi lokal.',
  'Gambaran umum ini memakai data tiruan sebagai dasar tampilan awal, sambil menunggu integrasi data asli dari admin desa.',
  'Desa Keseneng berada di wilayah perbukitan yang mendukung aktivitas pertanian, perkebunan, dan kegiatan masyarakat berbasis gotong royong. Warga menjaga potensi pangan, seni tradisi, serta produk lokal sebagai identitas desa yang terus dikembangkan.',
  'Sejarah Desa',
  'Linimasa perkembangan Desa Keseneng dari masa ke masa.',
  'Data berikut bersifat tiruan untuk membentuk pola tampilan sejarah desa sebelum konten resmi dimasukkan oleh admin.',
  'Kondisi Geografis',
  'Lanskap desa yang mendukung pangan dan wisata lokal.',
  'Wilayah desa didominasi area permukiman, sawah, kebun, dan ruang kegiatan warga. Kondisi alam ini menjadi modal penting untuk pengembangan pertanian produktif, kegiatan edukasi, dan potensi kunjungan berbasis budaya desa.',
  'Visi Desa',
  'Terwujudnya Desa Keseneng yang maju, terbuka, mandiri, dan berdaya melalui potensi lokal.',
  'Visi dan misi ini memakai data tiruan untuk memandu desain halaman, sehingga admin nantinya tinggal mengganti konten resmi desa.',
  TRUE
) ON DUPLICATE KEY UPDATE
  village_name = VALUES(village_name),
  hero_eyebrow = VALUES(hero_eyebrow),
  hero_title = VALUES(hero_title),
  hero_description = VALUES(hero_description),
  overview_kicker = VALUES(overview_kicker),
  overview_title = VALUES(overview_title),
  overview_description = VALUES(overview_description),
  overview_body = VALUES(overview_body),
  history_kicker = VALUES(history_kicker),
  history_title = VALUES(history_title),
  history_description = VALUES(history_description),
  geography_kicker = VALUES(geography_kicker),
  geography_title = VALUES(geography_title),
  geography_description = VALUES(geography_description),
  vision_label = VALUES(vision_label),
  vision_title = VALUES(vision_title),
  vision_description = VALUES(vision_description),
  is_active = VALUES(is_active);

INSERT INTO village_profile_facts (id, profile_id, section, label, value, display_order) VALUES
  ('44be20e1-3628-4ca4-b6e8-f42ad4e70201', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'hero', 'Kecamatan', 'Mojotengah', 1),
  ('44be20e1-3628-4ca4-b6e8-f42ad4e70202', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'hero', 'Kabupaten', 'Wonosobo', 2),
  ('44be20e1-3628-4ca4-b6e8-f42ad4e70203', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'hero', 'Provinsi', 'Jawa Tengah', 3),
  ('44be20e1-3628-4ca4-b6e8-f42ad4e70204', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'hero', 'Karakter', 'Agraris dan budaya', 4),
  ('44be20e1-3628-4ca4-b6e8-f42ad4e70205', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'geography_stat', 'Luas wilayah', '328 ha', 1),
  ('44be20e1-3628-4ca4-b6e8-f42ad4e70206', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'geography_stat', 'Jumlah dusun', '6 dusun', 2),
  ('44be20e1-3628-4ca4-b6e8-f42ad4e70207', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'geography_stat', 'Ketinggian', '820 mdpl', 3),
  ('44be20e1-3628-4ca4-b6e8-f42ad4e70208', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'geography_stat', 'Dominasi lahan', 'Sawah dan kebun', 4),
  ('44be20e1-3628-4ca4-b6e8-f42ad4e70209', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'geography_border', 'Utara', 'Desa tetangga kawasan perbukitan', 1),
  ('44be20e1-3628-4ca4-b6e8-f42ad4e70210', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'geography_border', 'Timur', 'Area kebun dan jalur penghubung dusun', 2),
  ('44be20e1-3628-4ca4-b6e8-f42ad4e70211', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'geography_border', 'Selatan', 'Lahan pertanian warga', 3),
  ('44be20e1-3628-4ca4-b6e8-f42ad4e70212', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'geography_border', 'Barat', 'Permukiman dan akses kecamatan', 4)
ON DUPLICATE KEY UPDATE
  section = VALUES(section),
  label = VALUES(label),
  value = VALUES(value),
  display_order = VALUES(display_order);

INSERT INTO village_profile_highlights (id, profile_id, label, value, display_order) VALUES
  ('0bf6eb73-aab5-4fd8-a7fc-f7bdbd6d0301', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Karakter desa', 'Agraris, guyub, dan aktif berkesenian', 1),
  ('0bf6eb73-aab5-4fd8-a7fc-f7bdbd6d0302', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Potensi utama', 'Pertanian pangan, kesenian tradisi, dan produk warga', 2),
  ('0bf6eb73-aab5-4fd8-a7fc-f7bdbd6d0303', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Arah digital', 'Informasi publik terbuka dan pengelolaan konten mandiri', 3)
ON DUPLICATE KEY UPDATE
  label = VALUES(label),
  value = VALUES(value),
  display_order = VALUES(display_order);

INSERT INTO village_profile_pillars (id, profile_id, name, display_order) VALUES
  ('a8d4ecbe-44e6-44e6-8734-cf45fb6b0401', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Pertanian', 1),
  ('a8d4ecbe-44e6-44e6-8734-cf45fb6b0402', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Kesenian', 2),
  ('a8d4ecbe-44e6-44e6-8734-cf45fb6b0403', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'UMKM', 3),
  ('a8d4ecbe-44e6-44e6-8734-cf45fb6b0404', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Gotong Royong', 4)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  display_order = VALUES(display_order);

INSERT INTO village_profile_timeline_items (id, profile_id, period, title, description, display_order) VALUES
  ('5ff23f7a-f1e7-4315-9d79-5fb3d6f50501', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Masa awal', 'Permukiman tumbuh di sekitar lahan produktif', 'Warga mulai membangun ruang hidup desa dari aktivitas bertani, berbagi sumber air, dan kerja kolektif antar-keluarga.', 1),
  ('5ff23f7a-f1e7-4315-9d79-5fb3d6f50502', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Penguatan dusun', 'Gotong royong menjadi pola utama pembangunan', 'Kegiatan jalan lingkungan, saluran air, dan ruang berkumpul warga dikerjakan melalui musyawarah serta swadaya masyarakat.', 2),
  ('5ff23f7a-f1e7-4315-9d79-5fb3d6f50503', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Era pelayanan publik', 'Administrasi desa semakin tertata', 'Perangkat desa mulai menata layanan kependudukan, arsip, dan program pembangunan agar lebih mudah dijangkau warga.', 3),
  ('5ff23f7a-f1e7-4315-9d79-5fb3d6f50504', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Hari ini', 'Keseneng masuk fase publikasi digital', 'Profil, berita, statistik, potensi, dan dokumen publik disiapkan dalam kanal digital untuk memperluas keterbukaan informasi.', 4)
ON DUPLICATE KEY UPDATE
  period = VALUES(period),
  title = VALUES(title),
  description = VALUES(description),
  display_order = VALUES(display_order);

INSERT INTO village_profile_missions (id, profile_id, focus, description, display_order) VALUES
  ('d9fd8ab2-1db6-4c41-9797-26fc4ac60601', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Pelayanan Publik', 'Meningkatkan kualitas pelayanan desa yang cepat, terbuka, dan mudah diakses warga.', 1),
  ('d9fd8ab2-1db6-4c41-9797-26fc4ac60602', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Potensi Lokal', 'Menguatkan pertanian, kesenian, dan UMKM sebagai identitas ekonomi Desa Keseneng.', 2),
  ('d9fd8ab2-1db6-4c41-9797-26fc4ac60603', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Partisipasi Warga', 'Mendorong gotong royong, musyawarah, dan keterlibatan warga dalam pembangunan desa.', 3),
  ('d9fd8ab2-1db6-4c41-9797-26fc4ac60604', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Digitalisasi Desa', 'Mengembangkan pemanfaatan teknologi untuk pengelolaan data dan publikasi kegiatan desa.', 4)
ON DUPLICATE KEY UPDATE
  focus = VALUES(focus),
  description = VALUES(description),
  display_order = VALUES(display_order);

INSERT INTO village_profile_officials (id, profile_id, name, role, focus, contact, area, display_order) VALUES
  ('2e10ba37-95a5-42b0-9795-fb0b63d60701', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Mugiharto, S.IP', 'Kepala Desa', 'Koordinasi pemerintahan dan arah pembangunan desa', 'kades@keseneng.desa.id', 'Pemerintahan', 1),
  ('2e10ba37-95a5-42b0-9795-fb0b63d60702', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Dwi Hermawan, ST', 'Sekretaris Desa', 'Administrasi, arsip, dan layanan informasi publik', 'sekdes@keseneng.desa.id', 'Administrasi', 2),
  ('2e10ba37-95a5-42b0-9795-fb0b63d60703', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Nisro, S.Sos', 'Kepala Urusan Keuangan', 'Pengelolaan anggaran, pembukuan, dan laporan keuangan desa', 'keuangan@keseneng.desa.id', 'Keuangan', 3),
  ('2e10ba37-95a5-42b0-9795-fb0b63d60704', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Sigit Hidayat', 'Kepala Urusan Umum dan Perencanaan', 'Perencanaan program, aset, dan tata usaha umum desa', 'perencanaan@keseneng.desa.id', 'Perencanaan', 4),
  ('2e10ba37-95a5-42b0-9795-fb0b63d60705', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Nurkhotib', 'Kepala Seksi Pelayanan dan Kesejahteraan', 'Pelayanan sosial, pemberdayaan, dan kesejahteraan warga', 'pelayanan@keseneng.desa.id', 'Pelayanan', 5),
  ('2e10ba37-95a5-42b0-9795-fb0b63d60706', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Sukarmiyadi', 'Kepala Seksi Pemerintahan', 'Ketertiban administrasi wilayah dan urusan pemerintahan desa', 'pemerintahan@keseneng.desa.id', 'Pemerintahan', 6),
  ('2e10ba37-95a5-42b0-9795-fb0b63d60707', '0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01', 'Surman Al Nurman Yuwono', 'Kepala Dusun Bugel', 'Koordinasi layanan warga dan kegiatan kewilayahan Dusun Bugel', 'bugel@keseneng.desa.id', 'Kewilayahan', 7)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role = VALUES(role),
  focus = VALUES(focus),
  contact = VALUES(contact),
  area = VALUES(area),
  display_order = VALUES(display_order);

