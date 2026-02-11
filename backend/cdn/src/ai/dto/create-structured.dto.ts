import { IsOptional, IsString } from 'class-validator';

export class CreateStructuredDto {
  @IsString()
  instructing: string;

  @IsString()
  @IsOptional()
  model: string;
}
