import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly client: OpenAI;
  private readonly logger = new Logger(AiService.name);
  private readonly defaultModel: string;

  constructor(private configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.defaultModel =
      this.configService.get<string>('OPENAI_MODEL') || 'gpt-4-turbo-preview';
  }

  // basic non streaming //
  async createCompletion(
    prompt: string,
    model?: string,
    messageContext?: {
      role: 'user' | 'assistant' | 'system';
      content: string;
    }[],
  ) {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        ...(messageContext ?? []),
        { role: 'user' as const, content: prompt },
      ];

      // get the response
      const res = await this.client.chat.completions.create({
        model: model || this.defaultModel,
        messages,
        temperature: 0.2,
      });

      this.logger.log(`Completion created with model: ${res.model}`);
      //

      const content = res.choices?.[0]?.message?.content ?? '';
      return { content, usage: res.usage };

      //
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'unknowen Error';
      const errorStack =
        error instanceof Error ? error.stack : 'unknowen Error';
      this.logger.error(
        `Error creating completion: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
