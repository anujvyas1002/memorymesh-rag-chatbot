import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadDocumentDto {
  @ApiPropertyOptional({
    description: 'Document title. Defaults to the uploaded filename when omitted.',
    maxLength: 512,
  })
  @IsOptional()
  @Transform(({ value }): string | undefined => (typeof value === 'string' ? value.trim() : undefined))
  @IsString()
  @MaxLength(512)
  public title?: string;

  @ApiPropertyOptional({ description: 'Origin of the document.', maxLength: 1024 })
  @IsOptional()
  @Transform(({ value }): string | undefined => (typeof value === 'string' ? value.trim() : undefined))
  @IsString()
  @MaxLength(1024)
  public source?: string;
}
