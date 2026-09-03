import { Library } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatStore } from '@/store/chat'

export default function SourcesPanel() {
  const messages = useChatStore((state) => state.messages)
  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant')
  const sources = lastAssistant?.sources ?? []

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-border-subtle bg-panel py-4">
      <div className="flex shrink-0 items-center gap-2 px-4">
        <Library className="size-4 text-primary-600" />
        <h2 className="text-sm font-semibold text-text-main">引用来源</h2>
      </div>
      <p className="mt-1 shrink-0 text-xs leading-relaxed text-text-muted px-4">
        回答使用的命中切片固定展示在右侧
      </p>

      {sources.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <Library className="size-8 text-text-muted" />
          <p className="text-xs text-text-muted">
            发送问题后，这里会展示引用切片
          </p>
        </div>
      ) : (
        <ScrollArea className="mt-3 flex-1 min-h-0  px-4">
          <div className="space-y-3">
            {sources.map((source, index) => (
              <div
                key={`${source.chunkId}-${index}`}
                className="rounded-md border border-border-subtle p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium text-text-main">
                    {source.documentName}
                  </span>
                  <Badge
                    variant="outline"
                    className="shrink-0 border-primary-200 bg-primary-50 text-primary-600"
                  >
                    {source.similarity.toFixed(4)}
                  </Badge>
                </div>
                <p className="mt-1.5 break-all line-clamp-4 text-xs leading-relaxed text-text-secondary">
                  {source.content}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
