import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListQueryParamDto {
  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type((): NumberConstructor => Number)
  @IsInt()
  @Min(0)
  public skip?: number;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type((): NumberConstructor => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  public take?: number;
}
