import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import type { DbConfig } from '../../shared/interfaces';

export const dbValidation: Joi.ObjectSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
});

export const dbConfig = registerAs(
  'db',
  (): DbConfig => ({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'rag',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  }),
);
