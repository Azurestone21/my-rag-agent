import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, Lock, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth'
import { Toaster } from '@/components/ui/sonner'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirectTo = params.get('redirect') || '/knowledge-base'

  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const loading = useAuthStore((s) => s.loading)

  const resetForm = () => {
    setUsername('')
    setPassword('')
    setConfirmPassword('')
  }

  const handleSwitch = (next: Mode) => {
    resetForm()
    setMode(next)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault()

    if (!username.trim()) return toast.error('请填写用户名')
    if (!password) return toast.error('请填写密码')

    try {
      if (mode === 'login') {
        await login({ username: username.trim(), password })
        toast.success('登录成功')
        navigate(redirectTo, { replace: true })
      } else {
        if (password.length < 6) return toast.error('密码至少 6 位')
        if (password !== confirmPassword) return toast.error('两次密码不一致')
        await register({ username: username.trim(), password, confirmPassword })
        toast.success('注册成功，请登录')
        handleSwitch('login')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败')
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* 左侧装饰区 */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-12 text-white sm:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Sparkles className="size-6" />
          </div>
          <h1 className="text-3xl font-bold">my-rag-agent</h1>
        </div>
        <p className="mt-4 max-w-md text-center text-lg text-white/80">
          企业级 RAG 知识库系统
        </p>
        <p className="mt-2 max-w-md text-center text-sm text-white/60">
          上传文档 · 智能切片 · 混合检索 · RAG 问答
        </p>
      </div>

      {/* 右侧卡片 */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 sm:flex-none sm:w-[480px]">
        <Card className="w-full border-0 shadow-none">
          <CardHeader className="space-y-1">
            <div className="mb-2 flex items-center gap-2 sm:hidden">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-white">
                <Sparkles className="size-4" />
              </div>
              <span className="font-semibold text-text-main">my-rag-agent</span>
            </div>
            <CardTitle className="text-2xl">
              {mode === 'login' ? '登录' : '注册'}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? '输入你的账号密码继续'
                : '填写以下信息创建账号'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9"
                    autoComplete={
                      mode === 'login' ? 'username' : 'username new-password'
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={mode === 'login' ? '请输入密码' : '至少 6 位'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认密码</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="再次输入密码"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {mode === 'login' ? '登录中...' : '注册中...'}
                  </>
                ) : mode === 'login' ? (
                  '登录'
                ) : (
                  '创建账号'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                还没有账号？
                <button
                  type="button"
                  onClick={() => handleSwitch('register')}
                  className="ml-1 font-medium text-primary hover:underline"
                >
                  立即注册
                </button>
              </>
            ) : (
              <>
                已有账号？
                <button
                  type="button"
                  onClick={() => handleSwitch('login')}
                  className="ml-1 font-medium text-primary hover:underline"
                >
                  立即登录
                </button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
      <Toaster richColors />
    </div>
  )
}
