ALTER TABLE users
  MODIFY COLUMN role ENUM('user', 'admin', 'cashier') NOT NULL DEFAULT 'user';
