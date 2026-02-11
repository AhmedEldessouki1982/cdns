import { IsOptional, IsString } from 'class-validator';

export class CreateCompletionDto {
  @IsString()
  prompt: string;

  @IsString()
  @IsOptional()
  model: string;

  @IsString()
  @IsOptional()
  messageContext: { role: 'user' | 'assistant' | 'system'; content: string }[];
}
