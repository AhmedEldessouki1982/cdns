//src/tod/tod.controller.ts
import { Controller, Get } from '@nestjs/common';
import { TodService } from './tod.service';

@Controller('tods')
export class TodController {
  constructor(private readonly todService: TodService) {}

  @Get()
  findAll() {
    return this.todService.findAll();
  }
}
