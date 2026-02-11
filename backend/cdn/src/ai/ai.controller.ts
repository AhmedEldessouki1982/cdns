import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { CreateCompletionDto } from './dto/create-completion.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  //post req, non stramin
  @Post('completion')
  @HttpCode(HttpStatus.CREATED)
  async completion(@Body() dto: CreateCompletionDto) {
    const { prompt, model, messageContext } = dto;

    try {
      return await this.aiService.createCompletion(
        prompt,
        model,
        messageContext,
      );
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'unknown error';

      throw new HttpException(
        { message: 'OpenAI completion failed', detail: errorMessage },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
