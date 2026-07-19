export interface LlmMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LlmCompletionParams {
  /** System prompt: instructions plus the retrieved context block. */
  system: string;
  /** Ordered conversation turns ending with the current user question. */
  messages: LlmMessage[];
  /** Optional per-call cap; falls back to the configured default. */
  maxTokens?: number;
}

/**
 * Pluggable chat-completion provider (integration layer).
 * Default implementation: ClaudeChatService (@anthropic-ai/sdk).
 */
export interface ILlmProvider {
  /** Provider identifier for telemetry / logs. */
  readonly providerName: string;

  /** Generate a single text completion. */
  complete(params: LlmCompletionParams): Promise<string>;
}

/** DI token for the configured LLM provider. */
export const LLM_PROVIDER = Symbol('LLM_PROVIDER');
