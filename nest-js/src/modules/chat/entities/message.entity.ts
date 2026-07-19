import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CitationModel } from '../models/citation.model';
import { MessageRoleEnum } from '../enums/message-role.enum';
import { ConversationEntity } from './conversation.entity';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Index()
  @Column({ type: 'uuid', name: 'conversation_id' })
  public conversationId!: string;

  @Column({ type: 'varchar', length: 16 })
  public role!: MessageRoleEnum;

  @Column({ type: 'text' })
  public content!: string;

  @Column({ type: 'jsonb', nullable: true })
  public sources!: CitationModel[] | null;

  @ManyToOne(() => ConversationEntity, conversation => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  public conversation!: ConversationEntity;

  @Index()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  public createdAt!: Date;
}
