CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง admin user เริ่มต้น (รหัสผ่านคือ '12345Svc')
INSERT INTO users (username, password, role)
VALUES ('Bornsvc', '$2a$10$mj1JpzWY6TYf/z.p9/x3.OZ8r.YEQHZXfKqxL.7YWzVc7nW7Qjxze', 'admin')
ON CONFLICT (username) DO NOTHING;