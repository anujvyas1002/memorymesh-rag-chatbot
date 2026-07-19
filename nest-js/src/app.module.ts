import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { DbConfig } from './shared/interfaces';
import {
  appConfig,
  authConfig,
  dbConfig,
  embeddingConfig,
  envValidationSchema,
  llmConfig,
  ragConfig,
} from './common/config';
import { CommonModule } from './common/common.module';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { ChatModule } from './modules/chat/chat.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, dbConfig, embeddingConfig, llmConfig, ragConfig],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: true, allowUnknown: true },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const db = configService.getOrThrow<DbConfig>('db');
        return {
          type: 'postgres' as const,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.name,
          autoLoadEntities: true,
          synchronize: db.synchronize,
          logging: db.logging,
        };
      },
    }),
    CommonModule,
    KnowledgeModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
})
export class AppModule {}
