UPDATE potential_categories
SET detail_description = CASE slug
  WHEN 'wisata-alam' THEN 'Data wisata alam disiapkan untuk memuat nama lokasi, akses, dokumentasi visual, narahubung, dan catatan singkat yang bisa dilengkapi admin desa.'
  WHEN 'agro-tourism' THEN 'Data agro tourism disiapkan untuk memuat lahan produktif, komoditas unggulan, kelompok tani, agenda panen, dan dokumentasi aktivitas yang bisa dilengkapi admin desa.'
  WHEN 'umkm' THEN 'Halaman detail UMKM disiapkan untuk menampung katalog produk, profil pelaku usaha, informasi kontak, dan cerita produksi agar produk lokal lebih mudah dipromosikan secara digital.'
  WHEN 'seni-budaya' THEN 'Data seni budaya disiapkan untuk memuat jenis kesenian, kelompok aktif, jadwal latihan, agenda pentas, dan dokumentasi cerita budaya yang bisa dilengkapi admin desa.'
  ELSE detail_description
END
WHERE slug IN ('wisata-alam', 'agro-tourism', 'umkm', 'seni-budaya');

DELETE FROM potential_opportunities;
DELETE FROM potential_programs;
