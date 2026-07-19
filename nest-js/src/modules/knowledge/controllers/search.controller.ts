import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CommonResponseDto } from '../../../common/dto/common-response.dto';
import { ListResponseDto } from '../../../common/dto/list-response.dto';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchResultDto } from '../dto/search-result.dto';
import { RetrievalService } from '../services/retrieval.service';

@ApiTags('search')
@ApiSecurity('api-key')
@Controller('search')
export class SearchController {
  constructor(private readonly retrievalService: RetrievalService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Pure vector similarity search over chunks (no generation).' })
  public async search(@Body() dto: SearchQueryDto): Promise<CommonResponseDto<ListResponseDto<SearchResultDto>>> {
    const chunks = await this.retrievalService.search(dto.query, dto.topK, dto.minScore);
    const items = chunks.map((chunk): SearchResultDto => SearchResultDto.fromModel(chunk));
    return CommonResponseDto.ok(new ListResponseDto(items, items.length), 'Search complete');
  }
}
