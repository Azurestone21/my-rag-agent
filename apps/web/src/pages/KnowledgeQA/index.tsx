import { useEffect, useState } from 'react'
import SearchParamsPanel from '@/components/params/SearchParamsPanel'
import ApiCallDialog from '@/pages/KnowledgeQA/components/ApiCallDialog'
import ChatPanel from '@/pages/KnowledgeQA/components/ChatPanel'
import ServiceCallSection from '@/pages/KnowledgeQA/components/ServiceCallSection'
import SourcesPanel from '@/pages/KnowledgeQA/components/SourcesPanel'
import { useChatStore } from '@/store/chat'
import { useKnowledgeBaseStore } from '@/store/knowledgeBase'
import type { ServiceCallVo } from '@my-rag-agent/shared'

export default function KnowledgeQAPage() {
  const params = useChatStore((state) => state.params)
  const setParams = useChatStore((state) => state.setParams)
  const loadServiceCalls = useChatStore((state) => state.loadServiceCalls)
  const clearMessages = useChatStore((state) => state.clearMessages)
  const selectedKbId = useKnowledgeBaseStore((state) => state.selectedKbId)
  const [viewingService, setViewingService] = useState<ServiceCallVo | null>(null)
  const [apiOpen, setApiOpen] = useState(false)

  useEffect(() => {
    void loadServiceCalls(selectedKbId || undefined).catch(() => undefined)
  }, [loadServiceCalls, selectedKbId])

  useEffect(() => {
    clearMessages()
  }, [selectedKbId, clearMessages])

  const handleViewService = (service: ServiceCallVo) => {
    setViewingService(service)
    setApiOpen(true)
  }

  return (
    <div className="w-full h-full flex items-start gap-4 overflow-x-auto hide-scrollbar">
      <aside className="w-72 shrink-0 space-y-4">
        <SearchParamsPanel
          title="模型回答参数"
          params={params}
          onChange={setParams}
        />
        <ServiceCallSection onViewService={handleViewService} />
      </aside>

      <div className="flex-1 h-full min-w-100">
        <ChatPanel />
      </div>

      <aside className="flex w-72 h-full shrink-0 flex-col">
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
