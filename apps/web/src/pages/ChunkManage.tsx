import { useState } from 'react'
import { Eye, FileText, Layers, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
import type { ChunkItem } from '@/mock/data'

function AddChunkDialog() {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const addChunk = useChunkStore((state) => state.addChunk)
  const documents = useDocumentStore((state) => state.documents)
  const selectedDocumentId = useChunkStore((state) => state.selectedDocumentId)

  const handleAdd = () => {
    if (!content.trim()) {
      toast.error('请输入切片内容')
      return
    }
    addChunk(content.trim())
    toast.success('切片已新增')
    setContent('')
    setOpen(false)
  }

  const targetDoc = documents.find((doc) => doc.id === selectedDocumentId)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        新增切片
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增切片</DialogTitle>
            <DialogDescription>
              为{targetDoc ? `「${targetDoc.name}」` : '当前文档'}添加新的文本切片。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
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
            <Button onClick={handleAdd}>确认新增</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function ChunkManagePage() {
  const chunks = useChunkStore((state) => state.chunks)
  const selectedDocumentId = useChunkStore((state) => state.selectedDocumentId)
  const setSelectedDocumentId = useChunkStore((state) => state.setSelectedDocumentId)
  const searchQuery = useChunkStore((state) => state.searchQuery)
  const setSearchQuery = useChunkStore((state) => state.setSearchQuery)
  const documents = useDocumentStore((state) => state.documents)
  const updateChunk = useChunkStore((state) => state.updateChunk)
  const deleteChunk = useChunkStore((state) => state.deleteChunk)
  const [viewingChunk, setViewingChunk] = useState<ChunkItem | null>(null)
  const [editingChunk, setEditingChunk] = useState<ChunkItem | null>(null)
  const [editingContent, setEditingContent] = useState('')

  const docNameMap = new Map(documents.map((doc) => [doc.id, doc.name]))

  const filteredChunks = chunks.filter((chunk) => {
    const chunkId = `${chunk.id}.${chunk.index}`
    const matchesDoc = !selectedDocumentId || chunk.documentId === selectedDocumentId
    const matchesQuery =
      !searchQuery ||
      chunkId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chunk.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDoc && matchesQuery
  })

  return (
    <div className="space-y-4">
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
          <AddChunkDialog />
        </div>
      </div>

      {filteredChunks.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-subtle bg-panel text-sm text-text-muted">
          <Layers className="size-8 text-text-muted" />
          {searchQuery || selectedDocumentId ? '未找到匹配的切片' : '暂无切片'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredChunks.map((chunk) => (
            <div
              key={`${chunk.id}-${chunk.index}`}
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
              <p className="mt-2 line-clamp-5 flex-1 whitespace-pre-line rounded-md bg-page p-3 text-sm leading-relaxed text-text-main">
                {chunk.content}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                <span>{chunk.charCount} 字符</span>
                <span>更新于 {chunk.updatedAt}</span>
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
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setEditingChunk(chunk)
                    setEditingContent(chunk.content)
                  }}
                >
                  <Pencil />
                  编辑
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="ml-auto text-red-600 hover:text-red-700"
                  onClick={() => {
                    deleteChunk(chunk.id, chunk.index)
                    toast.success('切片已删除')
                  }}
                >
                  <Trash2 />
                  删除
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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

      <Dialog
        open={editingChunk !== null}
        onOpenChange={(open) => {
          if (!open) setEditingChunk(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑切片</DialogTitle>
            <DialogDescription>
              {editingChunk
                ? `修改「${docNameMap.get(editingChunk.documentId) ?? '未知文档'}」中的切片内容`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Textarea
              className="min-h-40"
              placeholder="请输入切片内容"
              value={editingContent}
              onChange={(event) => setEditingContent(event.target.value)}
            />
            <div className="text-right text-xs text-text-muted">
              {editingContent.length} 字符
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingChunk(null)}>
              取消
            </Button>
            <Button
              onClick={() => {
                if (!editingChunk) return
                if (!editingContent.trim()) {
                  toast.error('切片内容不能为空')
                  return
                }
                updateChunk(
                  editingChunk.id,
                  editingChunk.index,
                  editingContent.trim(),
                )
                toast.success('切片已更新')
                setEditingChunk(null)
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
