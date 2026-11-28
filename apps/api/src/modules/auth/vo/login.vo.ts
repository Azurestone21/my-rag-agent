import { ApiProperty } from "@nestjs/swagger";
import { LoginVo as LoginVoShared } from "@my-rag-agent/shared";

export class LoginVo implements LoginVoShared {
  @ApiProperty({ description: '用户ID' })
  userId: number;
  
  @ApiProperty({ description: 'JWT令牌' })
  token: string;
  
  @ApiProperty({ description: '用户所有工作空间' })
  workspaces: {
    id: string;
    name: string;
    type: number;
    role: number;
  }[];
}
