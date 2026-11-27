import type { CommonPageDto as CommonPageDtoShared } from '@my-rag-agent/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min, IsInt } from 'class-validator';

export class CommonPageDto implements CommonPageDtoShared {
  @ApiProperty({ description: '当前页码', example: 1 })
  @IsNumber()
  @IsInt()
  @Min(1)
  pageNum: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(500)
  pageSize: number;
}
