import { create } from 'zustand'
import { authApi } from '@/service/auth'
import { TOKEN_KEY, USER_KEY } from '@/constants/stroage.constants'

interface UserInfo {
  userId: number
  username: string
}

interface AuthState {
  token: string | null
  user: UserInfo | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (
    username: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>
  logout: () => void
  init: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
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

  login: async (username, password) => {
    set({ loading: true })
    try {
      const res = await authApi.login(username, password)
      localStorage.setItem(TOKEN_KEY, res.token)
      const user: UserInfo = { userId: res.userId, username }
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      set({ token: res.token, user, loading: false })
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  register: async (username, password, confirmPassword) => {
    set({ loading: true })
    try {
      await authApi.register(username, password, confirmPassword)
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
}))
