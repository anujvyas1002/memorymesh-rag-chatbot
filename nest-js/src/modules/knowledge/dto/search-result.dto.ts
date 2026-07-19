import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RetrievedChunkModel } from '../models/retrieved-chunk.model';

export class SearchResultDto {
  @ApiProperty({ format: 'uuid' })
  public chunkId: string;

  @ApiProperty({ format: 'uuid' })
  public documentId: string;

  @ApiProperty()
  public documentTitle: string;

  @ApiPropertyOptional({ nullable: true })
  public source: string | null;

  @ApiProperty()
  public chunkIndex: number;

  @ApiProperty()
  public content: string;

  @ApiProperty({ description: 'Cosine similarity in [0, 1]; higher is more relevant.' })
  public score: number;

  constructor(model: RetrievedChunkModel) {
    this.chunkId = model.chunkId;
    this.documentId = model.documentId;
    this.documentTitle = model.documentTitle;
    this.source = model.source;
    this.chunkIndex = model.chunkIndex;
    this.content = model.content;
    this.score = model.score;
  }

  public static fromModel(model: RetrievedChunkModel): SearchResultDto {
    return new SearchResultDto(model);
  }
}
