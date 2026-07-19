import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { RagConfig } from '../../../shared/interfaces';
import { ILlmProvider, LLM_PROVIDER } from '../../../common/services/llm-provider.interface';
import { AppException } from '../../../common/exceptions/app.exception';
import { RetrievalService } from '../../knowledge/services/retrieval.service';
import { RetrievedChunkModel } from '../../knowledge/models/retrieved-chunk.model';
import { AskDto } from '../dto/ask.dto';
import { ConversationEntity } from '../entities/conversation.entity';
import { MessageEntity } from '../entities/message.entity';
import { MessageRoleEnum } from '../enums/message-role.enum';
import { ChatAnswerModel, CitationModel } from '../models/citation.model';
import { PromptBuilderService } from './prompt-builder.service';

@Injectable()
export class ChatService {
  private static readonly SNIPPET_LENGTH = 240;

  private readonly cfg: RagConfig;

  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly configService: ConfigService,
    private readonly retrievalService: RetrievalService,
    private readonly promptBuilder: PromptBuilderService,
    @Inject(LLM_PROVIDER) private readonly llmProvider: ILlmProvider,
  ) {
    this.cfg = this.configService.getOrThrow<RagConfig>('rag');
  }

  /** Full RAG turn: retrieve → build prompt → generate → persist → return answer. */
  public async ask(dto: AskDto): Promise<ChatAnswerModel> {
    const conversation = await this.resolveConversation(dto.conversationId, dto.question);
    const history = await this.loadHistory(conversation.id);

    const chunks = await this.retrievalService.search(dto.question, dto.topK, dto.minScore);
    const citations = this.toCitations(chunks);

    const system = this.promptBuilder.buildSystemPrompt(chunks);
    const messages = this.promptBuilder.buildMessages(history, dto.question);
    const answer = await this.llmProvider.complete({ system, messages });

    await this.persistTurn(conversation.id, dto.question, answer, citations);

    return {
      conversationId: conversation.id,
      answer,
      citations,
      retrievedCount: chunks.length,
    };
  }

  public async listConversations(skip: number, take: number): Promise<[ConversationEntity[], number]> {
    return this.conversationRepository.findAndCount({
      order: { updatedAt: 'DESC' },
      skip,
      take,
    });
  }

  public async getConversation(id: string): Promise<ConversationEntity> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: { messages: true },
      order: { messages: { createdAt: 'ASC' } },
    });
    if (conversation === null) {
      throw new AppException('Conversation not found', 404);
    }
    return conversation;
  }

  public async removeConversation(id: string): Promise<void> {
    const result = await this.conversationRepository.delete({ id });
    if (result.affected === 0) {
      throw new AppException('Conversation not found', 404);
    }
  }

  private async resolveConversation(id: string | undefined, question: string): Promise<ConversationEntity> {
    if (id !== undefined) {
      const existing = await this.conversationRepository.findOne({ where: { id } });
      if (existing === null) {
        throw new AppException('Conversation not found', 404);
      }
      return existing;
    }
    const conversation = this.conversationRepository.create({ title: this.deriveTitle(question) });
    return this.conversationRepository.save(conversation);
  }

  private async loadHistory(conversationId: string): Promise<MessageEntity[]> {
    const recent = await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      take: this.cfg.historyLimit,
    });
    return recent.reverse();
  }

  private async persistTurn(
    conversationId: string,
    question: string,
    answer: string,
    citations: CitationModel[],
  ): Promise<void> {
    const userMessage = this.messageRepository.create({
      conversationId,
      role: MessageRoleEnum.User,
      content: question,
      sources: null,
    });
    const assistantMessage = this.messageRepository.create({
      conversationId,
      role: MessageRoleEnum.Assistant,
      content: answer,
      sources: citations.length > 0 ? citations : null,
    });
    await this.messageRepository.save([userMessage, assistantMessage]);
    await this.conversationRepository.update({ id: conversationId }, { updatedAt: new Date() });
  }

  private toCitations(chunks: RetrievedChunkModel[]): CitationModel[] {
    return chunks.map(
      (chunk, i): CitationModel => ({
        index: i + 1,
        chunkId: chunk.chunkId,
        documentId: chunk.documentId,
        documentTitle: chunk.documentTitle,
        source: chunk.source,
        score: chunk.score,
        snippet: this.snippet(chunk.content),
      }),
    );
  }

  private snippet(content: string): string {
    if (content.length <= ChatService.SNIPPET_LENGTH) {
      return content;
    }
    return `${content.slice(0, ChatService.SNIPPET_LENGTH).trimEnd()}…`;
  }

  private deriveTitle(question: string): string {
    const trimmed = question.trim();
    if (trimmed.length <= 80) {
      return trimmed;
    }
    return `${trimmed.slice(0, 80).trimEnd()}…`;
  }
}
