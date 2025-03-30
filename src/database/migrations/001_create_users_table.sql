-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user'
);

-- Create initial admin user
-- Default admin credentials:
-- username: Bornsvc
-- password: 12345Svc
INSERT INTO users (username, password, role)
VALUES ('Bornsvc', '$2a$10$8KzaNdKIMyOkASCH4QvSB.kLmKHFSO1YqiUZqYI6PvN2OSGXEiXGi', 'admin')
ON CONFLICT (username) DO NOTHING;