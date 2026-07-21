CREATE TABLE IF NOT EXISTS gallery_albums (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(180) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  category VARCHAR(120) NOT NULL DEFAULT 'Kegiatan Desa',
  description TEXT NOT NULL,
  cover_image_url VARCHAR(500) NOT NULL,
  cover_image_alt VARCHAR(220) NOT NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gallery_albums_status_order (status, display_order),
  INDEX idx_gallery_albums_category_status (category, status),
  INDEX idx_gallery_albums_published_at (published_at)
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id CHAR(36) PRIMARY KEY,
  album_id CHAR(36) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_alt VARCHAR(220) NOT NULL,
  taken_at DATETIME NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gallery_photos_album_order (album_id, display_order),
  INDEX idx_gallery_photos_taken_at (taken_at),
  CONSTRAINT fk_gallery_photos_album
    FOREIGN KEY (album_id) REFERENCES gallery_albums(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gallery_videos (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(180) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url VARCHAR(500) NOT NULL,
  thumbnail_alt VARCHAR(220) NOT NULL,
  video_url VARCHAR(500) NULL,
  duration_seconds INT NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gallery_videos_status_order (status, display_order),
  INDEX idx_gallery_videos_published_at (published_at)
);
