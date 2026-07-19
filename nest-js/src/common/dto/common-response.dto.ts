import { ApiProperty } from '@nestjs/swagger';

export class CommonResponseDto<T = unknown> {
  @ApiProperty({ example: 'OK' })
  public message: string;

  @ApiProperty({ example: 'success' })
  public status: string;

  @ApiProperty({ example: 200 })
  public statusCode: number;

  @ApiProperty()
  public data?: T;

  constructor(partial: Partial<CommonResponseDto<T>> = {}) {
    this.message = partial.message ?? 'OK';
    this.status = partial.status ?? 'success';
    this.statusCode = partial.statusCode ?? 200;
    this.data = partial.data;
  }

  public static ok<TData>(data: TData, message = 'OK'): CommonResponseDto<TData> {
    return new CommonResponseDto<TData>({ message, status: 'success', statusCode: 200, data });
  }

  public static created<TData>(data: TData, message = 'Created'): CommonResponseDto<TData> {
    return new CommonResponseDto<TData>({ message, status: 'success', statusCode: 201, data });
  }
}
