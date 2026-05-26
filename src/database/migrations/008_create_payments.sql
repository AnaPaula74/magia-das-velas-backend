CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,

  payment_id VARCHAR(255) NOT NULL,
  order_id INT NOT NULL,

  method ENUM('pix', 'mercadopago') NOT NULL,

  amount DECIMAL(10,2) NOT NULL,

  status VARCHAR(50) NOT NULL,

  description VARCHAR(255) NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_payments_payment_id
  ON payments(payment_id);

CREATE INDEX idx_payments_order_id
  ON payments(order_id);