import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingsService {
  private embeddingClient: OpenAI;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.embeddingClient = new OpenAI({
      apiKey: apiKey,
    });
    this.model = 'text-embedding-3-small';
  }

  async embedding(paragraph: string, model?: string): Promise<number[]> {
    try {
      if (
        !paragraph ||
        typeof paragraph !== 'string' ||
        paragraph.trim().length === 0
      ) {
        throw new BadRequestException(
          'The data under embedding process is not a valid string',
        );
      }

      const res = await this.embeddingClient.embeddings.create({
        model: model || this.model,
        input: paragraph,
      });

      return res.data[0].embedding;
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(
        `Failed to create embedding: ${errorMessage}`,
      );
    }
  }
}
