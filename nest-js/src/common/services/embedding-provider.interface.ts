/**
 * Pluggable text-embedding provider (integration layer).
 * Default implementation: GeminiEmbeddingService (@google/genai).
 */
export interface IEmbeddingProvider {
  /** Provider identifier for telemetry / logs. */
  readonly providerName: string;

  /** Dimensionality of the vectors this provider returns. */
  readonly dimensions: number;

  /** Embed a single piece of text (e.g. a search query). */
  embedOne(text: string): Promise<number[]>;

  /** Embed many texts (e.g. document chunks) preserving input order. */
  embedMany(texts: string[]): Promise<number[][]>;
}

/** DI token for the configured embedding provider. */
export const EMBEDDING_PROVIDER = Symbol('EMBEDDING_PROVIDER');
