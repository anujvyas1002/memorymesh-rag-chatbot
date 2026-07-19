import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({ example: 'How many paid leave days do employees get?' })
  @Transform(({ value }): string => (typeof value === 'string' ? value.trim() : ''))
  @IsString()
  @MinLength(1)
  public query!: string;

  @ApiPropertyOptional({ description: 'Number of chunks to return.', minimum: 1, maximum: 50 })
  @IsOptional()
  @Type((): NumberConstructor => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  public topK?: number;

  @ApiPropertyOptional({
    description: 'Minimum cosine similarity (0-1) for a chunk to be included.',
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Type((): NumberConstructor => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  public minScore?: number;
}
