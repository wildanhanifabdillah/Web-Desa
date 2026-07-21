ALTER TABLE admin_users
  ADD COLUMN phone VARCHAR(40) NULL AFTER email,
  ADD COLUMN avatar_url VARCHAR(500) NULL AFTER phone,
  ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0 AFTER last_login_at,
  ADD COLUMN locked_until DATETIME NULL AFTER failed_login_attempts,
  ADD COLUMN password_reset_token_hash VARCHAR(255) NULL AFTER locked_until,
  ADD COLUMN password_reset_expires_at DATETIME NULL AFTER password_reset_token_hash,
  ADD COLUMN email_verified_at DATETIME NULL AFTER password_reset_expires_at,
  ADD INDEX idx_admin_users_email_status (email, status),
  ADD INDEX idx_admin_users_reset_token (password_reset_token_hash),
  ADD INDEX idx_admin_users_locked_until (locked_until);

INSERT INTO admin_users (
  id,
  name,
  email,
  password_hash,
  status,
  email_verified_at
) VALUES (
  '8f6d9f84-4a52-4d6b-8a57-200000000001',
  'Administrator Desa Keseneng',
  'admin@keseneng.desa.id',
  '$2b$10$replaceWithRealHashBeforeProduction000000000000000000000000000',
  'active',
  CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  status = VALUES(status),
  email_verified_at = COALESCE(admin_users.email_verified_at, VALUES(email_verified_at));

INSERT INTO admin_user_roles (user_id, role_id)
VALUES (
  '8f6d9f84-4a52-4d6b-8a57-200000000001',
  '8f6d9f84-4a52-4d6b-8a57-100000000001'
)
ON DUPLICATE KEY UPDATE
  assigned_at = assigned_at;
