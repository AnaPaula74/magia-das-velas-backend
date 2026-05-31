ALTER TABLE orders
  ADD COLUMN source ENUM('online', 'pos') NOT NULL DEFAULT 'online' AFTER status,
  ADD COLUMN payment_method ENUM('cash', 'card', 'pix', 'mercadopago') NULL AFTER source,
  ADD COLUMN sold_by_user_id INT NULL AFTER payment_method,
  ADD COLUMN customer_name VARCHAR(160) NULL AFTER sold_by_user_id,
  ADD COLUMN customer_phone VARCHAR(30) NULL AFTER customer_name,
  ADD COLUMN paid_at TIMESTAMP NULL AFTER customer_phone,
  ADD COLUMN cancelled_at TIMESTAMP NULL AFTER paid_at;

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_sold_by_user
    FOREIGN KEY (sold_by_user_id)
    REFERENCES users(id)
    ON DELETE SET NULL;

CREATE INDEX idx_orders_source ON orders(source);
CREATE INDEX idx_orders_payment_method ON orders(payment_method);
CREATE INDEX idx_orders_sold_by_user_id ON orders(sold_by_user_id);
