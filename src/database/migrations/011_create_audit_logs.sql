CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id INT NULL,

  action VARCHAR(120) NOT NULL,

  details TEXT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_user_id
  ON audit_logs(user_id);

CREATE INDEX idx_audit_logs_action
  ON audit_logs(action);