import SearchParamsPanel from '@/components/params/SearchParamsPanel'
import { History, Search, SearchX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSearchStore } from '@/store/search'
import { useKnowledgeBaseStore } from '@/store/knowledgeBase'

export default function KnowledgeSearchPage() {
  const params = useSearchStore((state) => state.params)
  const setParams = useSearchStore((state) => state.setParams)
  const query = useSearchStore((state) => state.query)
  const results = useSearchStore((state) => state.results)
  const history = useSearchStore((state) => state.history)
  const runSearch = useSearchStore((state) => state.runSearch)
  const setQuery = useSearchStore((state) => state.setQuery)
  const selectedKbId = useKnowledgeBaseStore((state) => state.selectedKbId)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-text-main">知识检索</h1>
        <p className="mt-0.5 text-sm text-text-muted">
          搜索知识库切片，调试 topK、阈值与命中效果
        </p>
      </div>

      <div className="flex items-start gap-4">
        <aside className="w-64 shrink-0">
          <SearchParamsPanel params={params} onChange={setParams} />
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              void runSearch(selectedKbId)
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                className="pl-9 bg-white"
                placeholder="输入查询内容..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Button type="submit">
              <Search />
              搜索
            </Button>
          </form>

          {history.length > 0 && (
            <div className="rounded-lg border border-border-subtle bg-panel p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-text-main">
                <History className="size-4 text-text-muted" />
                检索历史
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {history.map((item) => (
                  <Button
                    key={item}
                    variant="outline"
                    className="h-auto rounded px-2 py-1 text-xs"
                    onClick={() => {
                      setQuery(item)
                      void runSearch(selectedKbId)
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border-subtle bg-panel py-20 text-center">
              <SearchX className="size-8 text-text-muted" />
              <p className="mt-3 text-sm font-medium text-text-main">
                暂无检索结果
              </p>
              <p className="mt-1 text-xs text-text-muted">
                调整检索参数，观察知识命中效果
              </p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-16rem)] space-y-3 overflow-y-auto pr-1">
              {results.map((result) => (
                <div
                  key={result.chunkId}
                  className="rounded-lg border border-border-subtle bg-panel p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-text-main">
                      {result.documentName}
                    </span>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-primary-200 bg-primary-50 text-primary-600"
                    >
                      相似度 {result.similarity.toFixed(6)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {result.content}
                  </p>
                  <p className="mt-2 font-mono text-xs text-text-muted">
                    切片 ID：{result.chunkId}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
