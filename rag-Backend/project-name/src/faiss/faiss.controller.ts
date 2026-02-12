import { Controller } from '@nestjs/common';
import { FaissService } from './faiss.service';

@Controller('faiss')
export class FaissController {
  constructor(private readonly faissService: FaissService) {}
}
