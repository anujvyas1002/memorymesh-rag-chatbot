import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import type { EmbeddingConfig } from '../../shared/interfaces';

export const embeddingValidation: Joi.ObjectSchema = Joi.object({
  GEMINI_API_KEY: Joi.string().allow('').default(''),
  EMBEDDING_MODEL: Joi.string().default('gemini-embedding-001'),
  EMBEDDING_DIMENSIONS: Joi.number().default(768),
  EMBEDDING_BATCH_SIZE: Joi.number().default(64),
});

export const embeddingConfig = registerAs(
  'embedding',
  (): EmbeddingConfig => ({
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model: process.env.EMBEDDING_MODEL ?? 'gemini-embedding-001',
    dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS ?? '768', 10),
    batchSize: parseInt(process.env.EMBEDDING_BATCH_SIZE ?? '64', 10),
  }),
);
