import { ServiceCallVo as ServiceCallVoShared } from '@my-rag-agent/shared';
import { ApiProperty } from '@nestjs/swagger';

export class ServiceCallVo implements ServiceCallVoShared {
  @ApiProperty({ description: '服务调用ID' })
  id: string;

  @ApiProperty({ description: '服务调用名称' })
  name: string;

  @ApiProperty({ description: '服务调用参数' })
  topK: number;

  @ApiProperty({ description: '服务调用API密钥' })
  apiKey: string;

  @ApiProperty({ description: '服务调用创建时间' })
  createdAt: string;
}
