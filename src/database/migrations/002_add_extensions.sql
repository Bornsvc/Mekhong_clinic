-- Enable necessary PostgreSQL extensions

-- uuid-ossp: For generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pg_trgm: For text search and similarity
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- citext: For case-insensitive text operations
CREATE EXTENSION IF NOT EXISTS "citext";

-- btree_gin: For faster indexing and searching
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Add comment explaining the purpose of extensions
COMMENT ON EXTENSION "uuid-ossp" IS 'Provides functions to generate UUIDs for unique identifiers';
COMMENT ON EXTENSION "pg_trgm" IS 'Provides trigram support for text search and similarity matching';
COMMENT ON EXTENSION "citext" IS 'Provides case-insensitive character string type';
COMMENT ON EXTENSION "btree_gin" IS 'Provides support for GIN indexes on scalar types';