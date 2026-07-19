import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import type { LlmConfig } from '../../shared/interfaces';

// GEMINI_API_KEY is validated by the embedding config (shared credential); the
// factory below reads it directly so we don't declare the same key twice.
export const llmValidation: Joi.ObjectSchema = Joi.object({
  GEMINI_MODEL: Joi.string().default('gemini-2.5-flash'),
  GEMINI_MAX_TOKENS: Joi.number().default(1024),
});

export const llmConfig = registerAs(
  'llm',
  (): LlmConfig => ({
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
    maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS ?? '1024', 10),
  }),
);
