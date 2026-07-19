import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageEntity } from '../entities/message.entity';
import { MessageRoleEnum } from '../enums/message-role.enum';
import { CitationModel } from '../models/citation.model';

export class MessageResponseDto {
  @ApiProperty({ format: 'uuid' })
  public id: string;

  @ApiProperty({ enum: MessageRoleEnum })
  public role: MessageRoleEnum;

  @ApiProperty()
  public content: string;

  @ApiPropertyOptional({ nullable: true })
  public sources: CitationModel[] | null;

  @ApiProperty()
  public createdAt: Date;

  constructor(entity: MessageEntity) {
    this.id = entity.id;
    this.role = entity.role;
    this.content = entity.content;
    this.sources = entity.sources;
    this.createdAt = entity.createdAt;
  }

  public static fromEntity(entity: MessageEntity): MessageResponseDto {
    return new MessageResponseDto(entity);
  }
}
