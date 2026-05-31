ALTER TABLE products
  ADD COLUMN physical_price DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER price;

UPDATE products
  SET physical_price = price;

CREATE INDEX idx_products_physical_price ON products(physical_price);
