ALTER TABLE berita
  ADD INDEX idx_berita_status_category_published_at (status, category, published_at),
  ADD FULLTEXT INDEX idx_berita_search_text (title, excerpt, content, category, author_name);
