import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export class AskDto {
  @ApiProperty({ example: 'How many paid leave days do employees get per year?' })
  @Transform(({ value }): string => (typeof value === 'string' ? value.trim() : ''))
  @IsString()
  @MinLength(1)
  public question!: string;

  @ApiPropertyOptional({
    description: 'Existing conversation to continue. Omit to start a new conversation.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  public conversationId?: string;

  @ApiPropertyOptional({ description: 'Chunks to retrieve for context.', minimum: 1, maximum: 50 })
  @IsOptional()
  @Type((): NumberConstructor => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  public topK?: number;

  @ApiPropertyOptional({ description: 'Minimum cosine similarity (0-1).', minimum: 0, maximum: 1 })
  @IsOptional()
  @Type((): NumberConstructor => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  public minScore?: number;
}
