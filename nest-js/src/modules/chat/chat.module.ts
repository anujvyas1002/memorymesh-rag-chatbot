import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { ChatController } from './controllers/chat.controller';
import { ConversationEntity } from './entities/conversation.entity';
import { MessageEntity } from './entities/message.entity';
import { ChatService } from './services/chat.service';
import { PromptBuilderService } from './services/prompt-builder.service';

/**
 * RAG question-answering. Depends on KnowledgeModule's RetrievalService (via its
 * public export) for context, and on the global LLM provider for generation.
 */
@Module({
  imports: [TypeOrmModule.forFeature([ConversationEntity, MessageEntity]), KnowledgeModule],
  controllers: [ChatController],
  providers: [ChatService, PromptBuilderService],
})
export class ChatModule {}
