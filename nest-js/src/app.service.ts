import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EMBEDDING_PROVIDER, IEmbeddingProvider } from './common/services/embedding-provider.interface';
import { ILlmProvider, LLM_PROVIDER } from './common/services/llm-provider.interface';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
  embeddingProvider: string;
  llmProvider: string;
  timestamp: string;
}

@Injectable()
export class AppService {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(EMBEDDING_PROVIDER) private readonly embeddingProvider: IEmbeddingProvider,
    @Inject(LLM_PROVIDER) private readonly llmProvider: ILlmProvider,
  ) {}

  public async health(): Promise<HealthStatus> {
    const database = await this.checkDatabase();
    return {
      status: database === 'up' ? 'ok' : 'degraded',
      database,
      embeddingProvider: this.embeddingProvider.providerName,
      llmProvider: this.llmProvider.providerName,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<'up' | 'down'> {
    try {
      await this.dataSource.query('SELECT 1');
      return 'up';
    } catch {
      return 'down';
    }
  }
}
