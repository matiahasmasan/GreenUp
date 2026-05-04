-- Order feedback / reviews (one row per order)
-- The Node server also runs CREATE TABLE IF NOT EXISTS for this on startup;
-- use this file for manual DBA setup or documentation.

CREATE TABLE IF NOT EXISTS order_reviews (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_order_reviews_order (order_id),
  CONSTRAINT fk_order_reviews_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
