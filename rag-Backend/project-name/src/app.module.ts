import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfModule } from './pdf/pdf.module';
import { ChunksModule } from './chunks/chunks.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PdfModule,
    ChunksModule,
    EmbeddingsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
