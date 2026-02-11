-- Note: pgvector extension must be enabled by a database superuser first
-- Run this command as a superuser: CREATE EXTENSION IF NOT EXISTS vector;
-- The extension should already exist if pgvector is installed

-- CreateTable
CREATE TABLE "rag_chunks" (
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
CREATE INDEX "rag_chunks_sourceTable_sourcePk_idx" ON "rag_chunks"("sourceTable", "sourcePk");

-- CreateIndex
CREATE UNIQUE INDEX "rag_chunks_sourceTable_sourcePk_field_chunkIndex_key" ON "rag_chunks"("sourceTable", "sourcePk", "field", "chunkIndex");

-- CreateIndex for vector similarity search (using HNSW index for better performance)
CREATE INDEX "rag_chunks_embedding_idx" ON "rag_chunks" USING hnsw ("embedding" vector_cosine_ops);
