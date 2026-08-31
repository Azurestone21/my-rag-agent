import { useState } from 'react'
import { KeyRound, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import CreateServiceCallDialog from '@/components/qa/CreateServiceCallDialog'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/store/chat'
import type { ServiceCall } from '@/mock/data'

type ServiceCallSectionProps = {
  onViewService: (service: ServiceCall) => void
}

export default function ServiceCallSection({
  onViewService,
}: ServiceCallSectionProps) {
  const serviceCalls = useChatStore((state) => state.serviceCalls)
  const deleteServiceCall = useChatStore((state) => state.deleteServiceCall)
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="rounded-lg border border-border-subtle bg-panel p-4">
      <div className="flex items-center gap-2">
        <KeyRound className="size-4 text-primary-600" />
        <h2 className="text-sm font-semibold text-text-main">服务调用</h2>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-text-muted">
        发布当前问答能力，使用 API Key 接入业务
      </p>

      <Button className="mt-3 w-full" onClick={() => setCreateOpen(true)}>
        <Plus />
        API 调用
      </Button>

      {serviceCalls.length === 0 ? (
        <div className="mt-3 rounded-md bg-page px-3 py-4 text-center text-xs leading-relaxed text-text-muted">
          暂无服务调用，创建后可生成 API Key 并对外提供问答接口。
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {serviceCalls.map((service) => (
            <div
              key={service.id}
              className="rounded-md border border-border-subtle p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="truncate text-sm font-medium text-text-main transition-colors hover:text-primary-600"
                  onClick={() => onViewService(service)}
                >
                  {service.name}
                </button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 text-text-muted hover:text-red-600"
                  onClick={() => {
                    deleteServiceCall(service.id)
                    toast.success(`服务「${service.name}」已删除`)
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
              <div className="mt-1 font-mono text-xs text-text-muted">
                topK {service.topK}
              </div>
              <Button
                variant="outline"
                size="xs"
                className="mt-2 w-full"
                onClick={() => onViewService(service)}
              >
                API 调用
              </Button>
            </div>
          ))}
        </div>
      )}

      <CreateServiceCallDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={onViewService}
      />
    </div>
  )
}
