import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { PdfService } from './pdf.service';
import { ChunksService } from 'src/chunks/chunks.service';
import { EmbeddingsService } from 'src/embeddings/embeddings.service';
import { FaissService } from 'src/faiss/faiss.service';

@Controller('pdf')
export class PdfController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly chunksService: ChunksService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly faissService: FaissService,
  ) {}

  @Get('process')
  async extract(@Query('file') file: string | string[] | undefined) {
    const filePath = Array.isArray(file) ? file[0] : file;

    if (
      filePath === undefined ||
      filePath === '' ||
      typeof filePath !== 'string'
    ) {
      throw new BadRequestException(
        'Query parameter "file" is required and must be a non-empty string (e.g. ?file=sheet.pdf)',
      );
    }

    // Extract text from PDF
    const thePDF = await this.pdfService.extractTextFromPdf(filePath);

    // Create chunks
    const chunks = this.chunksService.createChunks(thePDF, filePath);

    // Generate embeddings for each chunk
    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (chunk) => ({
        ...chunk,
        embedding: await this.embeddingsService.embedding(chunk.text),
      })),
    );

    // Add vectors to FAISS index
    const faissResult = this.faissService.addVectors(
      chunksWithEmbeddings.map((chunk) => chunk.embedding),
      chunks,
    );
    if (!faissResult) {
      throw new InternalServerErrorException(
        'Failed to add vectors to FAISS index',
      );
    }

    return {
      document: filePath,
      pagesCount: thePDF.length,
      chunksCount: chunks.length,
      faissResult,
      // chunks: chunksWithEmbeddings, // embeddings
    };
  }
}
