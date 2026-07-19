import { Global, Module } from '@nestjs/common';
import { GeminiChatService } from './services/gemini-chat.service';
import { GeminiEmbeddingService } from './services/gemini-embedding.service';
import { EMBEDDING_PROVIDER } from './services/embedding-provider.interface';
import { LLM_PROVIDER } from './services/llm-provider.interface';

/**
 * Global module exposing the integration layer (embedding + LLM providers)
 * behind DI tokens so domain modules depend on abstractions, not concretes.
 * Swap the `useClass` bindings here to change provider without touching callers.
 */
@Global()
@Module({
  providers: [
    { provide: EMBEDDING_PROVIDER, useClass: GeminiEmbeddingService },
    { provide: LLM_PROVIDER, useClass: GeminiChatService },
  ],
  exports: [EMBEDDING_PROVIDER, LLM_PROVIDER],
})
export class CommonModule {}
