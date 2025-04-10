-- Enable plpgsql extension which is required for PostgreSQL stored procedures and functions
CREATE EXTENSION IF NOT EXISTS plpgsql;

-- Add comment explaining the purpose of plpgsql extension
COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language for PostgreSQL';