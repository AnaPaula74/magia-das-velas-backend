CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,

  order_id INT NOT NULL,
  product_id INT NOT NULL,

  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_order_items_order_id
  ON order_items(order_id);

CREATE INDEX idx_order_items_product_id
  ON order_items(product_id);