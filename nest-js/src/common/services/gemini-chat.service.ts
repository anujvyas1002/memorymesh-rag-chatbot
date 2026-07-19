import { Content, GoogleGenAI } from '@google/genai';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LlmConfig } from '../../shared/interfaces';
import { AppException } from '../exceptions/app.exception';
import { ILlmProvider, LlmCompletionParams } from './llm-provider.interface';

/**
 * Integration layer wrapping Google Gemini text generation (@google/genai).
 *
 * Framework-agnostic: domain services depend on the ILlmProvider abstraction.
 */
@Injectable()
export class GeminiChatService implements ILlmProvider, OnModuleInit {
  public readonly providerName = 'gemini';

  private readonly logger = new Logger(GeminiChatService.name);

  private readonly cfg: LlmConfig;

  private client!: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    this.cfg = this.configService.getOrThrow<LlmConfig>('llm');
  }

  public onModuleInit(): void {
    if (this.cfg.apiKey.length === 0) {
      this.logger.warn('GEMINI_API_KEY is empty — completion calls will fail until it is set.');
    }
    this.client = new GoogleGenAI({ apiKey: this.cfg.apiKey });
  }

  public async complete(params: LlmCompletionParams): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: this.cfg.model,
        // Gemini uses the 'model' role where the Messages API uses 'assistant'.
        contents: params.messages.map(
          (message): Content => ({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.content }],
          }),
        ),
        config: {
          systemInstruction: params.system,
          maxOutputTokens: params.maxTokens ?? this.cfg.maxTokens,
        },
      });

      const text = (response.text ?? '').trim();

      if (text.length === 0) {
        throw new AppException('LLM returned an empty completion', 502);
      }
      return text;
    } catch (error: unknown) {
      if (error instanceof AppException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`Gemini completion request failed: ${message}`);
      throw new AppException('Failed to generate completion', 502);
    }
  }
}
