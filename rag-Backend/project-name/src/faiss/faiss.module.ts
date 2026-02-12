import { Module } from '@nestjs/common';
import { FaissService } from './faiss.service';
import { FaissController } from './faiss.controller';

@Module({
  controllers: [FaissController],
  providers: [FaissService],
})
export class FaissModule {}
