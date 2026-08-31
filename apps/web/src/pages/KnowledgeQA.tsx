import { useState } from 'react'
import SearchParamsPanel from '@/components/params/SearchParamsPanel'
import ApiCallDialog from '@/components/qa/ApiCallDialog'
import ChatPanel from '@/components/qa/ChatPanel'
import ServiceCallSection from '@/components/qa/ServiceCallSection'
import SourcesPanel from '@/components/qa/SourcesPanel'
import { useChatStore } from '@/store/chat'
import type { ServiceCall } from '@/mock/data'

export default function KnowledgeQAPage() {
  const params = useChatStore((state) => state.params)
  const setParams = useChatStore((state) => state.setParams)
  const [viewingService, setViewingService] = useState<ServiceCall | null>(null)
  const [apiOpen, setApiOpen] = useState(false)

  const handleViewService = (service: ServiceCall) => {
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

      <aside className="w-72 shrink-0">
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
