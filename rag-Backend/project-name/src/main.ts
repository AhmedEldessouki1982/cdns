import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend access
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 4000);
  console.log(`RAG Backend running on http://localhost:${process.env.PORT ?? 4000}`);
}
bootstrap();
