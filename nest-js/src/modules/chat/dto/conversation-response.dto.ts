import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConversationEntity } from '../entities/conversation.entity';
import { MessageResponseDto } from './message-response.dto';

export class ConversationResponseDto {
  @ApiProperty({ format: 'uuid' })
  public id: string;

  @ApiPropertyOptional({ nullable: true })
  public title: string | null;

  @ApiPropertyOptional({ type: (): (typeof MessageResponseDto)[] => [MessageResponseDto] })
  public messages?: MessageResponseDto[];

  @ApiProperty()
  public createdAt: Date;

  @ApiProperty()
  public updatedAt: Date;

  constructor(entity: ConversationEntity) {
    this.id = entity.id;
    this.title = entity.title;
    this.messages =
      entity.messages === undefined
        ? undefined
        : entity.messages.map((message): MessageResponseDto => MessageResponseDto.fromEntity(message));
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }

  public static fromEntity(entity: ConversationEntity): ConversationResponseDto {
    return new ConversationResponseDto(entity);
  }
}
