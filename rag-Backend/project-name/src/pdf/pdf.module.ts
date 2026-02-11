import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { ChunksService } from 'src/chunks/chunks.service';
import { EmbeddingsService } from 'src/embeddings/embeddings.service';

@Module({
  controllers: [PdfController],
  providers: [PdfService, ChunksService, EmbeddingsService],
})
export class PdfModule {}
