import type { LoginVo } from '@my-rag-agent/shared'
import { request } from './request'

export const authApi = {
  /** 用户登录，返回 JWT */
  login: (username: string, password: string) =>
    request<LoginVo>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  /** 用户注册 */
  register: (username: string, password: string, confirmPassword: string) =>
    request<{ id: number }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, confirmPassword }),
    }),
}
