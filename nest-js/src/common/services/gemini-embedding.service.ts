import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EmbeddingConfig } from '../../shared/interfaces';
import { AppException } from '../exceptions/app.exception';
import { IEmbeddingProvider } from './embedding-provider.interface';

interface ContentEmbedding {
  values?: number[];
}

interface EmbedContentResponse {
  embeddings?: ContentEmbedding[];
}

/**
 * Integration layer wrapping Google Gemini text embeddings (@google/genai).
 *
 * Framework-agnostic: no domain logic lives here. Domain services depend on the
 * IEmbeddingProvider abstraction, never on this class directly.
 */
@Injectable()
export class GeminiEmbeddingService implements IEmbeddingProvider, OnModuleInit {
  public readonly providerName = 'gemini';

  public readonly dimensions: number;

  private readonly logger = new Logger(GeminiEmbeddingService.name);

  private readonly cfg: EmbeddingConfig;

  private client!: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    this.cfg = this.configService.getOrThrow<EmbeddingConfig>('embedding');
    this.dimensions = this.cfg.dimensions;
  }

  public onModuleInit(): void {
    if (this.cfg.apiKey.length === 0) {
      this.logger.warn('GEMINI_API_KEY is empty — embedding calls will fail until it is set.');
    }
    this.client = new GoogleGenAI({ apiKey: this.cfg.apiKey });
  }

  public async embedOne(text: string): Promise<number[]> {
    const [vector] = await this.embedMany([text]);
    return vector;
  }

  public async embedMany(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const results: number[][] = [];
    for (let offset = 0; offset < texts.length; offset += this.cfg.batchSize) {
      const batch = texts.slice(offset, offset + this.cfg.batchSize);
      const embedded = await this.embedBatch(batch);
      results.push(...embedded);
    }
    return results;
  }

  private async embedBatch(batch: string[]): Promise<number[][]> {
    try {
      const response = (await this.client.models.embedContent({
        model: this.cfg.model,
        contents: batch,
        config: { outputDimensionality: this.dimensions },
      })) as EmbedContentResponse;

      const embeddings = response.embeddings ?? [];
      if (embeddings.length !== batch.length) {
        throw new AppException(
          `Embedding provider returned ${embeddings.length} vectors for ${batch.length} inputs`,
          502,
        );
      }

      return embeddings.map((item, index): number[] => {
        const values = item.values ?? [];
        if (values.length !== this.dimensions) {
          throw new AppException(
            `Embedding dimension mismatch at index ${index}: expected ${this.dimensions}, got ${values.length}`,
            502,
          );
        }
        return values;
      });
    } catch (error: unknown) {
      if (error instanceof AppException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`Gemini embedding request failed: ${message}`);
      throw new AppException('Failed to generate embeddings', 502);
    }
  }
}
