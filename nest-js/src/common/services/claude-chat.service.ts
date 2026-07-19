import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LlmConfig } from '../../shared/interfaces';
import { AppException } from '../exceptions/app.exception';
import { ILlmProvider, LlmCompletionParams } from './llm-provider.interface';

/**
 * Integration layer wrapping the Anthropic Claude Messages API (@anthropic-ai/sdk).
 *
 * Framework-agnostic: domain services depend on the ILlmProvider abstraction.
 */
@Injectable()
export class ClaudeChatService implements ILlmProvider, OnModuleInit {
  public readonly providerName = 'claude';

  private readonly logger = new Logger(ClaudeChatService.name);

  private readonly cfg: LlmConfig;

  private client!: Anthropic;

  constructor(private readonly configService: ConfigService) {
    this.cfg = this.configService.getOrThrow<LlmConfig>('llm');
  }

  public onModuleInit(): void {
    if (this.cfg.apiKey.length === 0) {
      this.logger.warn('ANTHROPIC_API_KEY is empty — completion calls will fail until it is set.');
    }
    this.client = new Anthropic({ apiKey: this.cfg.apiKey });
  }

  public async complete(params: LlmCompletionParams): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.cfg.model,
        max_tokens: params.maxTokens ?? this.cfg.maxTokens,
        system: params.system,
        messages: params.messages,
      });

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block): string => block.text)
        .join('')
        .trim();

      if (text.length === 0) {
        throw new AppException('LLM returned an empty completion', 502);
      }
      return text;
    } catch (error: unknown) {
      if (error instanceof AppException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`Claude completion request failed: ${message}`);
      throw new AppException('Failed to generate completion', 502);
    }
  }
}
