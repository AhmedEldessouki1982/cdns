import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import path from 'path';
import fs from 'fs-extra';
import { ExtractedPage } from 'src/common/interfaces/extracted-page.interface';
import { lookup as lookupMime } from 'mime-types';
// Use require for CommonJS module compatibility with pdf-parse 1.x
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const pdfParseModule = require('pdf-parse');

// pdf-parse 1.x exports a function directly
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const pdfParse = (pdfParseModule.default || pdfParseModule) as unknown as (
  dataBuffer: Buffer,
) => Promise<{ text: string; numpages: number }>;

@Injectable()
export class PdfService {
  private readonly filePath = path.join(process.cwd(), 'data', 'pdfs');

  async extractTextFromPdf(pdfPath: string): Promise<ExtractedPage[]> {
    if (!pdfPath || typeof pdfPath !== 'string') {
      throw new BadRequestException('PDF path must be a valid string');
    }
    const pdf = path.join(this.filePath, pdfPath);

    try {
      // Validate if the file exists
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (!(await fs.pathExists(pdf))) {
        throw new NotFoundException(`PDF file not found: ${pdfPath}`);
      }

      // Validate mime type
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const mimeType = lookupMime(pdf) as string | false;
      if (mimeType !== 'application/pdf') {
        throw new BadRequestException(
          `Invalid file type: ${mimeType}. Expected application/pdf`,
        );
      }

      // Read pdf file
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const pdfBuffer = (await fs.readFile(pdf)) as Buffer;

      // Parse pdf file
      const parsedPDF = await pdfParse(pdfBuffer);

      // Confirm the pdf has text
      if (!parsedPDF.text || parsedPDF.text.trim().length === 0) {
        throw new BadRequestException(
          `PDF file does not contain extractable text: ${pdfPath}`,
        );
      }

      // Split text into pages
      const rawPdfPages = parsedPDF.text.split('\f');

      // Extract text from each page
      const extractedPages: ExtractedPage[] = rawPdfPages.map(
        (page, index) => ({
          page: index + 1,
          text: page.trim(),
        }),
      );

      // Return extracted pages
      return extractedPages;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(
        `Failed to extract text from PDF: ${errorMessage}`,
      );
    }
  }
}
