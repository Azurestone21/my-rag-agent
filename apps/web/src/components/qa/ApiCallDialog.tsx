import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ServiceCall } from '@/mock/data'

type ApiCallDialogProps = {
  service: ServiceCall | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function InfoRow({
  label,
  value,
  mono = true,
  code = false,
}: {
  label: string
  value: string
  mono?: boolean
  code?: boolean
}) {
  const copy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => toast.success(`${label}已复制`))
      .catch(() => toast.error('复制失败'))
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-muted">{label}</span>
        <Button variant="ghost" size="icon-xs" onClick={copy}>
          <Copy />
        </Button>
      </div>
      <div
        className={cn(
          'rounded-md bg-page px-3 py-2 text-xs break-all',
          mono && 'font-mono',
          code && 'whitespace-pre-wrap leading-relaxed',
        )}
      >
        {value}
      </div>
    </div>
  )
}

export default function ApiCallDialog({
  service,
  open,
  onOpenChange,
}: ApiCallDialogProps) {
  if (!service) return null

  const requestUrl = `/api/service-calls/${service.id}/chat/stream`
  const curlExample = `curl -N -X POST "http://localhost:3000${requestUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${service.apiKey}" \\
  -d '{"message":"你的问题"}'`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>API 调用</DialogTitle>
          <DialogDescription>
            使用服务 ID 与 API Key，将知识问答接入业务系统。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-text-main">
                {service.name}
              </div>
              <div className="font-mono text-xs text-text-muted">
                {service.id}
              </div>
            </div>
            <Badge variant="outline" className="shrink-0">
              topK {service.topK}
            </Badge>
          </div>

          <InfoRow label="请求地址" value={requestUrl} />
          <InfoRow
            label="请求 Header"
            value={`Authorization: Bearer ${service.apiKey}`}
          />
          <InfoRow label="API Key" value={service.apiKey} />
          <InfoRow label="请求示例" value={curlExample} code />

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-text-muted">
              返回类型
            </span>
            <div className="rounded-md bg-page px-3 py-2 text-xs text-text-secondary">
              <Badge
                variant="outline"
                className="mr-2 border-primary-200 bg-primary-50 text-primary-600"
              >
                text/event-stream
              </Badge>
              事件类型与页面问答一致：metadata、sources、done、error。
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
