import { create } from 'zustand'
import { authApi } from '@/service/auth'
import { TOKEN_KEY, USER_KEY } from '@/constants/stroage.constants'
import { persist } from 'zustand/middleware'
import type { LoginDto, RegisterDto } from '@my-rag-agent/shared'

interface UserInfo {
  userId: number
  username: string
}

interface AuthState {
  token: string | null
  user: UserInfo | null
  workspaces: any[]
  loading: boolean
  login: (dto: LoginDto) => Promise<void>
  register: (dto: RegisterDto) => Promise<void>
  logout: () => void
  init: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      workspaces: [],
      loading: false,

      init: () => {
        const token = localStorage.getItem(TOKEN_KEY)
        const userStr = localStorage.getItem(USER_KEY)
        if (token) {
          set({
            token,
            user: userStr ? (JSON.parse(userStr) as UserInfo) : null,
          })
        }
      },

      login: async (dto: LoginDto) => {
        set({ loading: true })
        try {
          const res = await authApi.login(dto)
          localStorage.setItem(TOKEN_KEY, res.token)
          const user: UserInfo = { userId: res.userId, username: dto.username }
          localStorage.setItem(USER_KEY, JSON.stringify(user))
          set({
            token: res.token,
            user,
            workspaces: res.workspaces,
            loading: false,
          })
        } catch (e) {
          set({ loading: false })
          throw e
        }
      },

      register: async (dto: RegisterDto) => {
        set({ loading: true })
        try {
          await authApi.register(dto)
          set({ loading: false })
        } catch (e) {
          set({ loading: false })
          throw e
        }
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        set({ token: null, user: null })
      },
    }),
    {
      name: 'auth-store',
    },
  ),
)
