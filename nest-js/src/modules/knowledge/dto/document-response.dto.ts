import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentStatusEnum } from '../enums/document-status.enum';
import { DocumentEntity } from '../entities/document.entity';

export class DocumentResponseDto {
  @ApiProperty({ format: 'uuid' })
  public id: string;

  @ApiProperty()
  public title: string;

  @ApiPropertyOptional({ nullable: true })
  public source: string | null;

  @ApiProperty({ enum: DocumentStatusEnum })
  public status: DocumentStatusEnum;

  @ApiProperty({ description: 'Number of embedded chunks generated for this document.' })
  public chunkCount: number;

  @ApiPropertyOptional({ nullable: true })
  public metadata: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true, description: 'Error message when status is failed.' })
  public error: string | null;

  @ApiProperty()
  public createdAt: Date;

  @ApiProperty()
  public updatedAt: Date;

  constructor(entity: DocumentEntity) {
    this.id = entity.id;
    this.title = entity.title;
    this.source = entity.source;
    this.status = entity.status;
    this.chunkCount = entity.chunkCount;
    this.metadata = entity.metadata;
    this.error = entity.error;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }

  public static fromEntity(entity: DocumentEntity): DocumentResponseDto {
    return new DocumentResponseDto(entity);
  }
}
