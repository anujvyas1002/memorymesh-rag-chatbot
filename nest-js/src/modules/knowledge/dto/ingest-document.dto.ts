import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class IngestDocumentDto {
  @ApiProperty({ example: 'Company Leave Policy 2026', maxLength: 512 })
  @Transform(({ value }): string => (typeof value === 'string' ? value.trim() : ''))
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  public title!: string;

  @ApiProperty({
    description: 'Raw text content to ingest, chunk and embed.',
    example: 'Employees are entitled to 24 days of paid leave per calendar year ...',
  })
  @Transform(({ value }): string => (typeof value === 'string' ? value.trim() : ''))
  @IsString()
  @MinLength(1)
  public content!: string;

  @ApiPropertyOptional({
    description: 'Origin of the document (URL, filename, system).',
    example: 'https://intranet/hr/leave-policy',
    maxLength: 1024,
  })
  @IsOptional()
  @Transform(({ value }): string | undefined => (typeof value === 'string' ? value.trim() : undefined))
  @IsString()
  @MaxLength(1024)
  public source?: string;

  @ApiPropertyOptional({
    description: 'Arbitrary metadata attached to the document and propagated to chunks.',
    example: { department: 'HR', year: 2026 },
  })
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, unknown>;
}
