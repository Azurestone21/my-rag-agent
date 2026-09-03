import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Eye, FileText, Layers, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ChunkDto } from '@my-rag-agent/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useChunkStore } from '@/store/chunk'
import { useDocumentStore } from '@/store/document'
import { useKnowledgeBaseStore } from '@/store/knowledgeBase'
import { formatDateTime } from '@/lib/format'

type ChunkDialogProps =
  | {
      /** 新增模式（可传入预设文档） */
      documentId?: string
      documentName?: string
      chunk?: never
      trigger?: React.ReactNode
    }
  | {
      /** 编辑模式 */
      chunk: ChunkDto
      documentId?: never
      documentName?: never
      trigger?: React.ReactNode
    }

function ChunkDialog(props: ChunkDialogProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [localDocId, setLocalDocId] = useState(props.documentId ?? '')
  const add = useChunkStore((state) => state.add)
  const update = useChunkStore((state) => state.update)
  const documents = useDocumentStore((state) => state.documents)
  const isEdit = Boolean(props.chunk)
  const needsDocSelect = !isEdit && !props.documentId

  useEffect(() => {
    if (open) {
      setContent(props.chunk?.content ?? '')
      setLocalDocId(props.documentId ?? '')
    }
  }, [open, props.chunk, props.documentId])

  const handleSubmit = async () => {
    if (!isEdit) {
      const docId = props.documentId || localDocId
      if (!docId) {
        toast.error('请选择要添加到的文档')
        return
      }
      if (!content.trim()) {
        toast.error('切片内容不能为空')
        return
      }
      try {
        await add(docId, content.trim())
        toast.success('切片已新增')
        setOpen(false)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '新增失败')
      }
      return
    }
    if (!content.trim()) {
      toast.error('切片内容不能为空')
      return
    }
    try {
      await update(props.chunk!.id, content.trim())
      toast.success('切片已更新')
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新失败')
    }
  }

  const docNameMap = new Map(documents.map((d) => [d.id, d.name]))
  const description = isEdit
    ? `修改「${docNameMap.get(props.chunk!.documentId) ?? '未知文档'}」中的切片内容`
    : needsDocSelect
      ? '选择要添加到的文档，然后输入切片内容。'
      : `为「${props.documentName || '当前文档'}」添加新的文本切片。`

  const defaultTrigger = isEdit ? (
    <Button variant="ghost" size="xs">
      <Pencil />
      编辑
    </Button>
  ) : (
    <Button>
      <Plus />
      新增切片
    </Button>
  )

  return (
    <>
      <span onClick={() => setOpen(true)}>{props.trigger ?? defaultTrigger}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? '编辑切片' : '新增切片'}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {needsDocSelect && (
              <div className="space-y-2">
                <Label>目标文档</Label>
                <Select value={localDocId} onValueChange={setLocalDocId}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择要添加到的文档" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Label htmlFor="chunk-content">切片内容</Label>
            <Textarea
              id="chunk-content"
              className="min-h-40"
              placeholder="请输入切片文本内容"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
            <div className="text-right text-xs text-text-muted">
              {content.length} 字符
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>{isEdit ? '保存' : '确认新增'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/** 尝试解析 JSON 对象，失败返回 null */
function tryParseJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim()
  if (!trimmed.startsWith('{')) return null
  try {
    const obj = JSON.parse(trimmed)
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj
  } catch {
    /* ignore */
  }
  return null
}

export default function ChunkManagePage() {
  const chunks = useChunkStore((state) => state.chunks)
  const selectedDocumentId = useChunkStore((state) => state.selectedDocumentId)
  const setSelectedDocumentId = useChunkStore((state) => state.setSelectedDocumentId)
  const searchQuery = useChunkStore((state) => state.searchQuery)
  const setSearchQuery = useChunkStore((state) => state.setSearchQuery)
  const loadChunks = useChunkStore((state) => state.load)
  const remove = useChunkStore((state) => state.remove)
  const documents = useDocumentStore((state) => state.documents)
  const loadDocuments = useDocumentStore((state) => state.load)
  const [viewingChunk, setViewingChunk] = useState<ChunkDto | null>(null)
  const [searchParams] = useSearchParams()
  const selectedKbId = useKnowledgeBaseStore((state) => state.selectedKbId)

  // 从 URL 参数读取 documentId，进入页面时自动选中
  useEffect(() => {
    const docIdFromUrl = searchParams.get('documentId')
    if (docIdFromUrl) {
      setSelectedDocumentId(docIdFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    void loadDocuments(selectedKbId || undefined).catch(() => undefined)
  }, [loadDocuments, selectedKbId])

  useEffect(() => {
    void loadChunks(
      selectedDocumentId || undefined,
      selectedKbId || undefined,
    ).catch(() => undefined)
  }, [selectedDocumentId, selectedKbId, loadChunks])

  const docNameMap = new Map(documents.map((doc) => [doc.id, doc.name]))
  const selectedDocName = docNameMap.get(selectedDocumentId) ?? ''

  const filteredChunks = chunks.filter((chunk) => {
    const chunkId = `${chunk.id}.${chunk.index}`
    const matchesDoc =
      !selectedDocumentId || chunk.documentId === selectedDocumentId
    const matchesQuery =
      !searchQuery ||
      chunkId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chunk.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDoc && matchesQuery
  })

  const handleDelete = async (chunk: ChunkDto) => {
    try {
      await remove(chunk.id)
      toast.success('切片已删除')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-text-main">切片管理</h1>
            <p className="mt-0.5 text-sm text-text-muted">
              共 {filteredChunks.length} 切片
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                className="w-64 pl-9"
                placeholder="搜索切片 ID"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <Select
              value={selectedDocumentId || 'all'}
              onValueChange={(value) =>
                setSelectedDocumentId(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="筛选文档" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部文档</SelectItem>
                {documents.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ChunkDialog
              documentId={selectedDocumentId}
              documentName={selectedDocName}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 min-h-0 overflow-y-auto pr-1">
        {filteredChunks.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-subtle bg-panel text-sm text-text-muted">
            <Layers className="size-8 text-text-muted" />
            {searchQuery || selectedDocumentId ? '未找到匹配的切片' : '暂无切片'}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredChunks.map((chunk) => (
              <div
                key={chunk.id}
                className="group flex flex-col rounded-lg border border-border-subtle bg-panel p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <FileText className="size-3.5 shrink-0 text-primary-600" />
                    <span className="truncate text-xs font-medium text-text-main">
                      {docNameMap.get(chunk.documentId) ?? '未知文档'}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-text-muted">
                    #{chunk.index + 1}
                  </span>
                </div>
                <div className="mt-1 truncate font-mono text-xs text-text-muted">
                  {chunk.id}.{chunk.index}
                </div>
                <div className="mt-2 flex-1 rounded-md bg-page p-2">
                  <div className="flex-1 overflow-y-auto text-sm leading-relaxed text-text-main [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ maxHeight: '5lh' }}>
                    {(() => {
                      const obj = tryParseJson(chunk.content)
                      if (obj) {
                        return Object.entries(obj).map(([key, value]) => (
                          <div key={key} className="flex gap-1.5">
                            <span className="shrink-0 font-medium text-text-secondary">{key}：</span>
                            <span className="break-all">{String(value)}</span>
                          </div>
                        ))
                      }
                      return <span className="whitespace-pre-line">{chunk.content}</span>
                    })()}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                  <span>{chunk.charCount} 字符</span>
                  <span>更新于 {formatDateTime(chunk.updatedAt)}</span>
                </div>
                <div className="mt-2 flex items-center gap-1 border-t border-border-subtle pt-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setViewingChunk(chunk)}
                  >
                    <Eye />
                    查看原文
                  </Button>
                  <ChunkDialog chunk={chunk} />
                  <Button
                    variant="ghost"
                    size="xs"
                    className="ml-auto text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(chunk)}
                  >
                    <Trash2 />
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={viewingChunk !== null}
        onOpenChange={(open) => {
          if (!open) setViewingChunk(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>切片原文</DialogTitle>
            <DialogDescription>
              {viewingChunk
                ? `${docNameMap.get(viewingChunk.documentId) ?? '未知文档'} · ${viewingChunk.id}.${viewingChunk.index}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto whitespace-pre-line rounded-md bg-page p-4 text-sm leading-relaxed text-text-main">
            {viewingChunk?.content}
          </div>
          <div className="text-right text-xs text-text-muted">
            {viewingChunk?.charCount} 字符
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
