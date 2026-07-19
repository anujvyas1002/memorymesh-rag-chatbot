import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: false,
  });
  const config = app.get(ConfigService);

  const apiPrefix = config.get<string>('app.apiPrefix') ?? 'api';
  const port = config.get<number>('app.port') ?? 3000;
  const corsOrigin = config.get<string>('app.corsOrigin') ?? '*';

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({ origin: corsOrigin, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  const swaggerCfg = new DocumentBuilder()
    .setTitle('RAG API')
    .setDescription('Retrieval-Augmented Generation (NestJS + pgvector + Gemini embeddings + Claude)')
    .setVersion('0.1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.listen(port);

  console.log(`RAG API listening on http://localhost:${port}/${apiPrefix}`);
}

bootstrap().catch((err: unknown): void => {
  console.error('Failed to bootstrap app', err);
  process.exit(1);
});
