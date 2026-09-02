import { useEffect, useState } from 'react'
import SearchParamsPanel from '@/components/params/SearchParamsPanel'
import ApiCallDialog from '@/components/qa/ApiCallDialog'
import ChatPanel from '@/components/qa/ChatPanel'
import ServiceCallSection from '@/components/qa/ServiceCallSection'
import SourcesPanel from '@/components/qa/SourcesPanel'
import { useChatStore } from '@/store/chat'
import type { ServiceCallDto } from '@my-rag-agent/shared'

export default function KnowledgeQAPage() {
  const params = useChatStore((state) => state.params)
  const setParams = useChatStore((state) => state.setParams)
  const loadServiceCalls = useChatStore((state) => state.loadServiceCalls)
  const [viewingService, setViewingService] = useState<ServiceCallDto | null>(null)
  const [apiOpen, setApiOpen] = useState(false)

  useEffect(() => {
    void loadServiceCalls().catch(() => undefined)
  }, [loadServiceCalls])

  const handleViewService = (service: ServiceCallDto) => {
    setViewingService(service)
    setApiOpen(true)
  }

  return (
    <div className="flex h-full items-start gap-4">
      <aside className="w-72 shrink-0 space-y-4">
        <SearchParamsPanel
          title="模型回答参数"
          params={params}
          onChange={setParams}
        />
        <ServiceCallSection onViewService={handleViewService} />
      </aside>

      <div className="h-full min-w-0 flex-1">
        <ChatPanel />
      </div>

      <aside className="flex h-full min-h-0 w-72 shrink-0 flex-col">
        <SourcesPanel />
      </aside>

      <ApiCallDialog
        service={viewingService}
        open={apiOpen}
        onOpenChange={setApiOpen}
      />
    </div>
  )
}
