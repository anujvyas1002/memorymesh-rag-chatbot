import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MessageEntity } from './message.entity';

@Entity('conversations')
export class ConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  public title!: string | null;

  @OneToMany(() => MessageEntity, message => message.conversation)
  public messages!: MessageEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  public updatedAt!: Date;
}
