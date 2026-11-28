import type { LoginDto, LoginVo, RegisterDto } from '@my-rag-agent/shared'
import { request } from './request'

export const authApi = {
  /** 用户登录，返回 JWT */
  login: (dto: LoginDto) =>
    request<LoginVo>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  /** 用户注册 */
  register: (dto: RegisterDto) =>
    request<{ id: number }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
}
