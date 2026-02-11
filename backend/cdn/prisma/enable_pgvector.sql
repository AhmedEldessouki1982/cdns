-- Enable pgvector extension
-- Run this as a database superuser (e.g., postgres user)
-- Command: psql -U postgres -d eldessouki -f enable_pgvector.sql
-- Or: psql $DATABASE_URL -f enable_pgvector.sql (if you have superuser access)

CREATE EXTENSION IF NOT EXISTS vector;
