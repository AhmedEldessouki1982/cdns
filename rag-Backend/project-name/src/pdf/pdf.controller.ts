import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { ChunksService } from 'src/chunks/chunks.service';
import { EmbeddingsService } from 'src/embeddings/embeddings.service';

@Controller('pdf')
export class PdfController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly chunksService: ChunksService,
    private readonly embeddingsService: EmbeddingsService,
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

    return {
      document: filePath,
      pagesCount: thePDF.length,
      chunksCount: chunks.length,
      chunks: chunksWithEmbeddings, // embeddings
    };
  }
}
