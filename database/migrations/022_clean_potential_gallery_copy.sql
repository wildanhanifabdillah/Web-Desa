UPDATE potential_gallery_items
SET description = 'Area terbuka desa yang didokumentasikan sebagai bagian dari potensi wisata.'
WHERE title = 'Ruang alam warga'
  AND description = 'Area terbuka desa yang dapat dikembangkan sebagai pengalaman wisata.';

UPDATE potential_items
SET summary = 'Area terbuka desa yang didokumentasikan sebagai bagian dari potensi wisata.',
    description = 'Area terbuka desa yang didokumentasikan sebagai bagian dari potensi wisata.',
    seo_description = 'Area terbuka desa yang didokumentasikan sebagai bagian dari potensi wisata.'
WHERE slug = 'wisata-alam-3'
  AND (summary = 'Area terbuka desa yang dapat dikembangkan sebagai pengalaman wisata.'
       OR description = 'Area terbuka desa yang dapat dikembangkan sebagai pengalaman wisata.'
       OR seo_description = 'Area terbuka desa yang dapat dikembangkan sebagai pengalaman wisata.');

UPDATE potential_gallery_items
SET description = 'Kemasan produk lokal menjadi bagian dari identitas usaha warga.'
WHERE title = 'Kemasan produk lokal'
  AND description = 'Penguatan kemasan membantu produk tampil lebih siap pasar.';

UPDATE potential_items
SET summary = 'Kemasan produk lokal menjadi bagian dari identitas usaha warga.',
    description = 'Kemasan produk lokal menjadi bagian dari identitas usaha warga.',
    seo_description = 'Kemasan produk lokal menjadi bagian dari identitas usaha warga.'
WHERE slug = 'umkm-2'
  AND (summary = 'Penguatan kemasan membantu produk tampil lebih siap pasar.'
       OR description = 'Penguatan kemasan membantu produk tampil lebih siap pasar.'
       OR seo_description = 'Penguatan kemasan membantu produk tampil lebih siap pasar.');
