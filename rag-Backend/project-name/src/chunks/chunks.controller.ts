import { Controller } from '@nestjs/common';
import { ChunksService } from './chunks.service';

@Controller('chunks')
export class ChunksController {
  constructor(private readonly chunksService: ChunksService) {}
}
