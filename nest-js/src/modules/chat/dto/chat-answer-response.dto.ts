import { ApiProperty } from '@nestjs/swagger';
import { ChatAnswerModel, CitationModel } from '../models/citation.model';

export class ChatAnswerResponseDto {
  @ApiProperty({ format: 'uuid' })
  public conversationId: string;

  @ApiProperty({ description: 'Generated answer grounded in retrieved context, with [n] citations.' })
  public answer: string;

  @ApiProperty({ description: 'Sources backing the answer, indexed to match [n] markers.' })
  public citations: CitationModel[];

  @ApiProperty({ description: 'Number of chunks retrieved as context for this answer.' })
  public retrievedCount: number;

  constructor(model: ChatAnswerModel) {
    this.conversationId = model.conversationId;
    this.answer = model.answer;
    this.citations = model.citations;
    this.retrievedCount = model.retrievedCount;
  }

  public static fromModel(model: ChatAnswerModel): ChatAnswerResponseDto {
    return new ChatAnswerResponseDto(model);
  }
}
