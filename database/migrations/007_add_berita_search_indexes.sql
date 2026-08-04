SET @database_name = DATABASE();

SET @has_status_category_index = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @database_name
    AND TABLE_NAME = 'berita'
    AND INDEX_NAME = 'idx_berita_status_category_published_at'
);
SET @add_status_category_index = IF(
  @has_status_category_index = 0,
  'ALTER TABLE berita ADD INDEX idx_berita_status_category_published_at (status, category, published_at)',
  'SELECT 1'
);
PREPARE add_status_category_index_statement FROM @add_status_category_index;
EXECUTE add_status_category_index_statement;
DEALLOCATE PREPARE add_status_category_index_statement;

SET @has_search_index = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @database_name
    AND TABLE_NAME = 'berita'
    AND INDEX_NAME = 'idx_berita_search_text'
);
SET @add_search_index = IF(
  @has_search_index = 0,
  'ALTER TABLE berita ADD FULLTEXT INDEX idx_berita_search_text (title, excerpt, content, category, author_name)',
  'SELECT 1'
);
PREPARE add_search_index_statement FROM @add_search_index;
EXECUTE add_search_index_statement;
DEALLOCATE PREPARE add_search_index_statement;