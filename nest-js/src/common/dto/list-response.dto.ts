import { ApiProperty } from '@nestjs/swagger';

export class ListResponseDto<T> {
  @ApiProperty({ isArray: true })
  public items: T[];

  @ApiProperty({ example: 0 })
  public total: number;

  constructor(items: T[], total: number) {
    this.items = items;
    this.total = total;
  }
}
