import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { CommonResponseDto } from './common/dto/common-response.dto';
import { AppService, HealthStatus } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Liveness/readiness probe with provider + DB status.' })
  public async health(): Promise<CommonResponseDto<HealthStatus>> {
    const status = await this.appService.health();
    return CommonResponseDto.ok(status, 'Service healthy');
  }
}
