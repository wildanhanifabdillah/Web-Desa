# Migrasi Runtime Data ke SQL

## Status Saat Ini

Fondasi SQL sudah tersedia:

- Driver database: `mysql2`
- Helper runtime: `lib/db.ts`
- Script cek koneksi: `npm run db:check`
- Script migration: `npm run db:migrate`
- Script seeder: `npm run db:seed`
- Script setup penuh: `npm run db:setup`

Modul yang sudah membaca/menulis ke SQL saat runtime:

- Berita (`berita`)
- Potensi kategori (`potential_categories` dan tabel relasinya)
- Potensi item (`potential_items`)
- Statistik publik dan admin (`data_statistik`, `statistic_sections`, `statistic_chart_items`)
- Homepage hero dan ringkasan profil (`homepage_hero_banners`, `homepage_profile_summaries`)
- Galeri album/foto/video (`gallery_albums`, `gallery_photos`, `gallery_videos`)
- Transparansi dokumen (`transparency_documents`)
- Dokumen/peraturan desa (`village_regulations`)
- Pengaturan website dan seni budaya (`admin_site_settings`)
- Konten umum admin (`admin_content_blocks`)
- Profil umum dan perangkat desa (`village_profiles`, `village_profile_facts`, `village_profile_officials`)

Catatan statistik: helper publik `lib/statistics.ts` dan admin store `lib/admin-statistics-store.ts` sekarang memakai tabel SQL yang sama. Shape respons publik tetap memakai slug sebagai `id`, misalnya `penduduk`, `usia`, dan `pendidikan`.

Sisa yang masih legacy/file-backed:

- Detail subprofil sejarah/geografi/visi-misi admin masih memakai store legacy. Halaman profil publik sudah mengambil profil umum dan perangkat dari SQL.
- Sensor bencana masih file-backed untuk snapshot MQTT. Pindahkan ke SQL hanya jika data sensor harus historis/persisten di database.
- Berita dan potensi masih menyimpan fallback JSON di kode untuk mode tanpa `DATABASE_URL`, tetapi runtime production dengan `DATABASE_URL` memakai SQL.

## Setup Lokal XAMPP

1. Jalankan MySQL/MariaDB dari XAMPP.
2. Buat database:

```sql
CREATE DATABASE desa_keseneng CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Buat atau update `.env.local`:

```env
DATABASE_URL=mysql://root:@localhost:3306/desa_keseneng
```

4. Install dependency bila belum:

```bash
npm install
```

5. Cek koneksi database:

```bash
npm run db:check
```

6. Jalankan migration dan seeder:

```bash
npm run db:setup
```

7. Jalankan app lokal:

```bash
npm run dev
```

8. Cek endpoint penting:

```bash
curl http://localhost:3000/api/statistics
curl http://localhost:3000/api/gallery
curl http://localhost:3000/api/transparency
curl http://localhost:3000/api/documents
```

## Setup VPS

1. Install Node.js, npm, dan MySQL/MariaDB.
2. Buat database dan user khusus:

```sql
CREATE DATABASE desa_keseneng CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'desa_user'@'localhost' IDENTIFIED BY 'password-kuat';
GRANT ALL PRIVILEGES ON desa_keseneng.* TO 'desa_user'@'localhost';
FLUSH PRIVILEGES;
```

3. Set environment production. Jika memakai file `.env.local` di server:

```env
DATABASE_URL=mysql://desa_user:password-kuat@localhost:3306/desa_keseneng
```

Jika memakai PM2, set env di `ecosystem.config.js` atau shell sebelum start. Jika memakai systemd, set `Environment=DATABASE_URL=...` di service file.

4. Deploy source dan install dependency:

```bash
git pull
npm install
```

5. Jalankan database setup:

```bash
npm run db:check
npm run db:migrate
npm run db:seed
```

6. Build dan restart aplikasi:

```bash
npm run build
pm2 restart nama-app
```

Jika tidak memakai PM2, sesuaikan dengan process manager yang dipakai, misalnya `systemctl restart nama-service`.

7. Pastikan folder upload writable:

```bash
mkdir -p public/uploads
chmod -R 755 public/uploads
```

Jika user Linux untuk Node berbeda, sesuaikan owner:

```bash
chown -R nodeuser:nodeuser public/uploads
```

8. Verifikasi dari VPS:

```bash
curl https://domain-desa.id/api/statistics
curl https://domain-desa.id/api/gallery
curl https://domain-desa.id/api/transparency
curl https://domain-desa.id/api/documents
```

## Catatan Operasional

- Jangan commit `.env.local`.
- Jangan mengandalkan folder `data/` untuk production, karena folder itu di-ignore git dan bisa berbeda antara lokal dan VPS.
- Seeder memakai `ON DUPLICATE KEY UPDATE` agar aman dijalankan ulang.
- Beberapa tombol reset admin mengosongkan tabel runtime. Untuk mengembalikan data awal, jalankan `npm run db:seed` lagi bila modul punya seeder.
- File upload tetap disimpan di filesystem (`public/uploads`). Database hanya menyimpan path file.
