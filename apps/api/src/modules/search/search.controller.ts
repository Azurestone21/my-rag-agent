import { Controller, Get, Query } from '@nestjs/common';
import { SearchDto } from './dto/search.dto.js';
import { SearchVo } from './vo/search.vo.js';
import { SearchService } from './search.service.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('search')
@ApiTags('知识检索')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  @ApiOperation({ summary: '检索知识库切片' })
  search(@Query() dto: SearchDto): Promise<SearchVo[]> {
    return this.service.search(dto);
  }
}
