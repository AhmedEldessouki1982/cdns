import { Module } from '@nestjs/common';
import { TodService } from './tod.service';
import { TodController } from './tod.controller';

@Module({
  controllers: [TodController],
  providers: [TodService],
})
export class TodModule {}
