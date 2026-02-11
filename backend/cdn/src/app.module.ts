import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { TodModule } from './tod/tod.module';
import { PaginationModule } from './pagination/pagination.module';
import { RagModule } from './ReferanceOnly/rag.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    AiModule,
    TodModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        if (!config.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY is required');
        }
        return config;
      },
    }),
    PaginationModule,
    RagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
