// src/rag/rag.controller.ts
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private rag: RagService) {}

  // Trigger ingestion for a single record/field
  @Post('ingest')
  async ingest(
    @Body()
    dto: {
      source_table: string;
      source_pk: string;
      field: string;
      content: string;
      tags?: string[];
    },
  ) {
    await this.rag.ingestField(dto);
    return { ok: true };
  }

  // Search endpoint (semantic)
  @Get('search')
  async search(@Query('q') q: string, @Query('tags') tags?: string) {
    const tagList = tags ? tags.split(',') : undefined;
    return this.rag.searchSimilar(q, 6, tagList);
  }

  // RAG answer endpoint
  @Get('answer')
  async answer(@Query('q') q: string) {
    return this.rag.answer(q);
  }

  // Backfill all records (demo)
  @Post('backfill/tods')
  async backfillTODs() {
    await this.rag.backfillTODs();
    return { ok: true };
  }
}
