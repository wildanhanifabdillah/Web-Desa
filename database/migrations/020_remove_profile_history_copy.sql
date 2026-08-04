UPDATE village_profiles
SET hero_description = 'Halaman profil menyajikan gambaran umum, kondisi geografis, visi misi, dan perangkat Desa Keseneng sebagai dasar informasi publik untuk warga dan pengunjung.',
    overview_description = 'Halaman profil menyajikan gambaran umum, kondisi geografis, visi misi, dan perangkat Desa Keseneng sebagai dasar informasi publik untuk warga dan pengunjung.'
WHERE slug = 'desa-keseneng'
  AND (hero_description LIKE '%sejarah%' OR overview_description LIKE '%sejarah%');
