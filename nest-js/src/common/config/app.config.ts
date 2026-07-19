import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import type { AppConfig } from '../../shared/interfaces';

export const appValidation: Joi.ObjectSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),
  CORS_ORIGIN: Joi.string().default('*'),
});

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
  }),
);
