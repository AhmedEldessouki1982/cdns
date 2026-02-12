import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfModule } from './pdf/pdf.module';
import { ChunksModule } from './chunks/chunks.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { ConfigModule } from '@nestjs/config';
import { FaissModule } from './faiss/faiss.module';

@Module({
  imports: [
    PdfModule,
    ChunksModule,
    EmbeddingsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FaissModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
