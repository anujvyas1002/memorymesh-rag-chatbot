import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import type { AuthConfig } from '../../shared/interfaces';

export const authValidation: Joi.ObjectSchema = Joi.object({
  API_KEY: Joi.string().allow('').default(''),
});

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    apiKey: process.env.API_KEY ?? '',
  }),
);
