import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import type { RagConfig } from '../../shared/interfaces';

export const ragValidation: Joi.ObjectSchema = Joi.object({
  RAG_CHUNK_SIZE: Joi.number().default(1200),
  RAG_CHUNK_OVERLAP: Joi.number().default(200),
  RAG_TOP_K: Joi.number().default(5),
  RAG_MIN_SCORE: Joi.number().default(0.2),
  RAG_HISTORY_LIMIT: Joi.number().default(10),
});

export const ragConfig = registerAs(
  'rag',
  (): RagConfig => ({
    chunkSize: parseInt(process.env.RAG_CHUNK_SIZE ?? '1200', 10),
    chunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP ?? '200', 10),
    topK: parseInt(process.env.RAG_TOP_K ?? '5', 10),
    minScore: parseFloat(process.env.RAG_MIN_SCORE ?? '0.2'),
    historyLimit: parseInt(process.env.RAG_HISTORY_LIMIT ?? '10', 10),
  }),
);
