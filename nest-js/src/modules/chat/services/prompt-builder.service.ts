import { Injectable } from '@nestjs/common';
import { LlmMessage } from '../../../common/services/llm-provider.interface';
import { RetrievedChunkModel } from '../../knowledge/models/retrieved-chunk.model';
import { MessageEntity } from '../entities/message.entity';
import { MessageRoleEnum } from '../enums/message-role.enum';

/**
 * Builds the grounded RAG prompt: a system message containing the numbered
 * context block plus citation rules, and the message array (prior turns +
 * the current question). Pure logic, no I/O.
 */
@Injectable()
export class PromptBuilderService {
  private static readonly INSTRUCTIONS = [
    'You are a retrieval-augmented assistant. Answer the user strictly using the',
    'CONTEXT passages below. Each passage is numbered like [1], [2].',
    '',
    'Rules:',
    '- Base every factual claim only on the provided context.',
    '- Cite the supporting passage inline using its number, e.g. "... 24 days [1]".',
    '- If the context does not contain the answer, say so plainly and do not invent facts.',
    '- Be concise and directly answer the question.',
  ].join('\n');

  public buildSystemPrompt(chunks: RetrievedChunkModel[]): string {
    if (chunks.length === 0) {
      return [PromptBuilderService.INSTRUCTIONS, '', 'CONTEXT:', '(no relevant passages were retrieved)'].join('\n');
    }

    const context = chunks
      .map((chunk, i): string => {
        const label = chunk.source ?? chunk.documentTitle;
        return `[${i + 1}] (source: ${label})\n${chunk.content}`;
      })
      .join('\n\n');

    return [PromptBuilderService.INSTRUCTIONS, '', 'CONTEXT:', context].join('\n');
  }

  /** Map prior conversation turns plus the new question into provider messages. */
  public buildMessages(history: MessageEntity[], question: string): LlmMessage[] {
    const messages: LlmMessage[] = history.map(
      (message): LlmMessage => ({
        role: message.role === MessageRoleEnum.Assistant ? 'assistant' : 'user',
        content: message.content,
      }),
    );
    messages.push({ role: 'user', content: question });
    return messages;
  }
}
