/**
 * RAG Service (NestJS)
 * --------------------
 * Responsibilities:
 *  - Convert text to embeddings (vectors)
 *  - Chunk long text into smaller pieces
 *  - Store chunks + embeddings in Postgres (pgvector)
 *  - Search by vector similarity
 *  - Build an answer from retrieved chunks
 *
 * Notes:
 *  - Requires PrismaService (your existing Prisma setup).
 *  - Requires OPENAI_API_KEY in environment.
 */

import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  // Initialize OpenAI client using your API key from environment
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });

  constructor(private prisma: PrismaService) {}

  // -----------------------------
  // 1) Embedding helper functions
  // -----------------------------

  /**
   * Turn a piece of text into an embedding (vector: number[]).
   * Embeddings convert semantic meaning into coordinates,
   * so "compressor trip due to vibration" will be close to
   * "shutdown caused by vibration alarm" in vector space.
   */
  async embedText(text: string): Promise<number[]> {
    // Choose a cost-effective model; dimension = 1536
    const res = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    // Return the numeric vector used for similarity search
    return res.data[0].embedding;
  }

  // -----------------------------
  // 2) Simple chunking utilities
  // -----------------------------

  /**
   * Split long text into chunks that fit well in retrieval.
   * Strategy:
   *  - Keep paragraph/sentence boundaries
   *  - Aim for ~512–1024 tokens (approx by chars here)
   *  - Avoid cutting mid-sentence to preserve meaning
   * This is a simple character-based chunker.
   */
  simpleChunks(
    text: string,
    maxChars = 1200,
  ): { index: number; content: string }[] {
    const parts: string[] = [];
    let buffer = '';

    // Split by paragraphs (empty lines)
    for (const para of text.split(/\n+/)) {
      const candidate = buffer ? buffer + '\n' + para : para;

      // If adding this paragraph exceeds max size, push the buffer and start new
      if (candidate.length > maxChars) {
        if (buffer.trim()) parts.push(buffer.trim());
        buffer = para;
      } else {
        buffer = candidate;
      }
    }

    // Push the remaining buffer
    if (buffer.trim()) parts.push(buffer.trim());

    // Return chunks with index
    return parts.map((content, index) => ({ index, content }));
  }

  // ------------------------------------
  // 3) Ingestion: store chunks + vectors
  // ------------------------------------

  /**
   * Ingest one record field:
   *  - Split the field content into chunks
   *  - Embed each chunk
   *  - Upsert into rag_chunks (pgvector)
   *
   * Params:
   *  - source_table: table name in your DB (e.g., 'punch_items')
   *  - source_pk:    record id (string)
   *  - field:        which column (e.g., 'description')
   *  - content:      raw text to index
   *  - tags:         optional metadata for filtering (e.g., ['FGC','vibration'])
   */
  async ingestField(params: {
    source_table: string;
    source_pk: string;
    field: string;
    content: string;
    tags?: string[];
  }) {
    // 1) Chunk the content
    const chunks = this.simpleChunks(params.content);

    // 2) For each chunk: embed and upsert into Postgres
    for (const c of chunks) {
      const embedding = await this.embedText(c.content);

      // Upsert ensures idempotency: if the same (table, pk, field, index) exists, update it
      const prismaClient = this.prisma as unknown as {
        $executeRawUnsafe: (
          query: string,
          ...values: unknown[]
        ) => Promise<number>;
      };

      await prismaClient.$executeRawUnsafe(
        `
        INSERT INTO rag_chunks (source_table, source_pk, field, chunk_index, content, embedding, tags)
        VALUES ($1, $2, $3, $4, $5, $6::vector, $7)
        ON CONFLICT (source_table, source_pk, field, chunk_index)
        DO UPDATE SET content = EXCLUDED.content,
                      embedding = EXCLUDED.embedding,
                      tags = EXCLUDED.tags,
                      updated_at = now()
        `,
        params.source_table,
        params.source_pk,
        params.field,
        c.index,
        c.content,
        JSON.stringify(embedding), // Cast JSON array -> vector via ::vector
        params.tags ?? null,
      );
    }

    this.logger.log(
      `Ingested ${chunks.length} chunk(s) for ${params.source_table}:${params.source_pk}.${params.field}`,
    );
  }

  // --------------------------------------------------
  // 4) Search: find top-K similar chunks to a question
  // --------------------------------------------------

  /**
   * Perform semantic search:
   *  - Embed the user query
   *  - Compare against stored vectors via cosine distance
   *  - Return top K chunks with scores and metadata
   *
   * Optional: filter by tags (e.g., subsystem, status).
   */
  async searchSimilar(
    query: string,
    limit = 6,
    tags?: string[],
  ): Promise<
    Array<{
      id: number;
      content: string;
      source_table: string;
      source_pk: string;
      field: string;
      score: number;
    }>
  > {
    // 1) Embed the query once per request
    const qEmb = await this.embedText(query);

    // 2) Vector similarity in Postgres using pgvector:
    //    - <=> returns cosine distance by default with vector_cosine_ops
    //    - We compute a similarity score as (1 - distance)
    const prismaClient = this.prisma as unknown as {
      $queryRawUnsafe: (
        query: string,
        ...values: unknown[]
      ) => Promise<
        Array<{
          id: number;
          content: string;
          source_table: string;
          source_pk: string;
          field: string;
          score: number;
        }>
      >;
    };

    const rows = await prismaClient.$queryRawUnsafe(
      `
      SELECT id, content, source_table, source_pk, field,
             1 - (embedding <=> $1::vector) AS score
      FROM rag_chunks
      WHERE ($2::text[] IS NULL OR tags && $2::text[])
      ORDER BY embedding <=> $1::vector
      LIMIT $3
      `,
      JSON.stringify(qEmb),
      tags ?? null,
      limit,
    );

    return rows; // [{id, content, source_table, source_pk, field, score}, ...]
  }

  // ----------------------------------------------------------
  // 5) Build an answer using retrieved chunks (simple RAG step)
  // ----------------------------------------------------------

  /**
   * Construct an answer strictly from retrieved context.
   * Guardrails:
   *  - Instruct the model to use ONLY the provided chunks
   *  - If insufficient, respond with "Not enough information."
   * Returns:
   *  - answer text
   *  - citations (the chunks used) for UI linking back to records
   */
  async answer(question: string) {
    // 1) Retrieve top chunks relevant to the question
    const chunks = await this.searchSimilar(question, 6);

    // 2) Build a compact context block (include record references)
    const context = chunks
      .map((c) => `- [${c.source_table}:${c.source_pk}] ${c.content}`)
      .join('\n');

    // 3) Guarded prompt: the model should answer only using context
    const prompt = `
You are a precise assistant for technical operations.

Use ONLY the context below. If the context is insufficient,
reply exactly: "Not enough information."

Question:
${question}

Context:
${context}
    `.trim();

    // 4) Call a chat model to generate the final answer
    const res = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini', // choose a chat model; keep temperature low for precision
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const answer =
      res.choices[0]?.message?.content ?? 'Not enough information.';
    return { answer, citations: chunks };
  }

  // ------------------------------------------------------
  // 6) Example: backfill ingestion for a full table (demo)
  // ------------------------------------------------------

  /**
   * Example backfill: walk a table and ingest the 'description' field.
   * Adapt `prisma.<model>.findMany` to your schema (e.g., TOD).
   * Batch-fetch to avoid loading too much at once.
   */
  async backfillTODs(batch = 200) {
    let cursor = 0;

    const prismaClient = this.prisma as unknown as {
      tOD: {
        findMany: (args: {
          take: number;
          skip: number;
          orderBy: { id: 'asc' };
          select: {
            id: true;
            punchId: true;
            description: true;
            system: true;
            status: true;
          };
        }) => Promise<
          Array<{
            id: number;
            punchId: string;
            description: string;
            system: string;
            status: boolean;
          }>
        >;
      };
    };

    while (true) {
      // Adjust the model + selected fields to your Prisma schema
      const items = await prismaClient.tOD.findMany({
        take: batch,
        skip: cursor,
        orderBy: { id: 'asc' },
        select: {
          id: true,
          punchId: true,
          description: true,
          system: true,
          status: true,
        },
      });

      if (!items.length) break;

      for (const it of items) {
        if (!it.description) continue;

        await this.ingestField({
          source_table: 'tod',
          source_pk: String(it.punchId),
          field: 'description',
          content: it.description,
          // Optional tags you can use for filtering
          tags: [it.system ?? '', it.status ? 'closed' : 'open'].filter(
            Boolean,
          ),
        });
      }

      cursor += items.length;
    }

    this.logger.log('Backfill completed for TOD.description');
  }
}
