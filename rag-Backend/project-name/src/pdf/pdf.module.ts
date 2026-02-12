import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { ChunksService } from 'src/chunks/chunks.service';
import { EmbeddingsService } from 'src/embeddings/embeddings.service';
import { FaissService } from 'src/faiss/faiss.service';
import { FaissModule } from 'src/faiss/faiss.module';

@Module({
  imports: [FaissModule],
  controllers: [PdfController],
  providers: [PdfService, ChunksService, EmbeddingsService, FaissService],
})
export class PdfModule {}
