-- Manual SQL script to create rag_chunks table
-- IMPORTANT: Run this as a database superuser, or ensure pgvector extension is enabled first
-- 
-- Step 1: Enable pgvector extension (requires superuser)
-- psql -U postgres -d eldessouki -c "CREATE EXTENSION IF NOT EXISTS vector;"
--
-- Step 2: Run this script
-- psql -U postgres -d eldessouki -f create_rag_chunks_manual.sql
-- Or: psql $DATABASE_URL -f create_rag_chunks_manual.sql

-- Enable pgvector extension (requires superuser)
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE IF NOT EXISTS "rag_chunks" (
    "id" SERIAL NOT NULL,
    "sourceTable" VARCHAR(255) NOT NULL,
    "sourcePk" VARCHAR(255) NOT NULL,
    "field" VARCHAR(255) NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rag_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "rag_chunks_sourceTable_sourcePk_idx" ON "rag_chunks"("sourceTable", "sourcePk");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "rag_chunks_sourceTable_sourcePk_field_chunkIndex_key" ON "rag_chunks"("sourceTable", "sourcePk", "field", "chunkIndex");

-- CreateIndex for vector similarity search (using HNSW index for better performance)
-- Note: HNSW requires pgvector 0.5.0+. If you get an error, use ivfflat instead:
-- CREATE INDEX "rag_chunks_embedding_idx" ON "rag_chunks" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS "rag_chunks_embedding_idx" ON "rag_chunks" USING hnsw ("embedding" vector_cosine_ops);
