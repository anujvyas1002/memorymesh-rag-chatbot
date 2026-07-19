import * as Joi from 'joi';
import { appValidation } from './app.config';
import { authValidation } from './auth.config';
import { dbValidation } from './db.config';
import { embeddingValidation } from './embedding.config';
import { llmValidation } from './llm.config';
import { ragValidation } from './rag.config';

export const envValidationSchema: Joi.ObjectSchema = appValidation
  .concat(dbValidation)
  .concat(authValidation)
  .concat(embeddingValidation)
  .concat(llmValidation)
  .concat(ragValidation);
