import { Controller, Get, Query } from '@nestjs/common';
import type { SearchResultDto } from '@my-rag-agent/shared';
import { SearchDto } from './dto/search.dto.js';
import { SearchService } from './search.service.js';

@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  search(@Query() dto: SearchDto): Promise<SearchResultDto[]> {
    return this.service.search(dto);
  }
}
