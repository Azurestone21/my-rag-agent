import { useEffect, useState } from 'react'
import { Database, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { KnowledgeBaseDto } from '@my-rag-agent/shared'
import KnowledgeBaseDialog from '@/components/business/CreateKnowledgeBaseButton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useKnowledgeBaseStore } from '@/store/knowledgeBase'
import { formatDateTime } from '@/lib/format'

export default function KnowledgeBasePage() {
  const knowledgeBases = useKnowledgeBaseStore((state) => state.knowledgeBases)
  const selectKb = useKnowledgeBaseStore((state) => state.selectKb)
  const deleteKb = useKnowledgeBaseStore((state) => state.deleteKb)
  const load = useKnowledgeBaseStore((state) => state.load)
  const navigate = useNavigate()
  const [deletingKb, setDeletingKb] = useState<KnowledgeBaseDto | null>(null)

  useEffect(() => {
    void load().catch(() => undefined)
  }, [load])

  const handleOpen = (kb: KnowledgeBaseDto) => {
    selectKb(kb.id)
    navigate('/documents')
  }

  const handleDelete = async () => {
    if (!deletingKb) return
    try {
      await deleteKb(deletingKb.id)
      toast.success(`知识库「${deletingKb.name}」已删除`)
      setDeletingKb(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-main">知识库</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            共 {knowledgeBases.length} 个知识库
          </p>
        </div>
        <KnowledgeBaseDialog />
      </div>

      {knowledgeBases.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-subtle bg-panel py-20 text-center">
          <Database className="size-8 text-text-muted" />
          <p className="text-sm font-medium text-text-main">暂无知识库</p>
          <p className="text-xs text-text-muted">
            创建知识库后即可上传文档、管理切片并进行检索问答
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {knowledgeBases.map((kb) => (
            <div
              key={kb.id}
              className="flex flex-col rounded-lg border border-border-subtle bg-panel p-5 transition-shadow hover:shadow-md"
            >
              <button
                type="button"
                className="text-left"
                onClick={() => handleOpen(kb)}
              >
                <div className="flex items-center gap-2">
                  <Database className="size-4 shrink-0 text-primary-600" />
                  <span className="text-base font-semibold text-text-main">
                    {kb.name}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                  {kb.description}
                </p>
              </button>

              <div className="mt-4 flex items-center gap-5 text-sm text-text-secondary">
                <span>
                  <span className="font-semibold text-text-main">
                    {kb.documentCount}
                  </span>{' '}
                  个文档
                </span>
                <span>
                  <span className="font-semibold text-text-main">
                    {kb.chunkCount}
                  </span>{' '}
                  个切片
                </span>
              </div>
              <div className="mt-1 text-xs text-text-muted">
                更新于 {formatDateTime(kb.updatedAt)}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
                <Button variant="outline" size="sm" onClick={() => handleOpen(kb)}>
                  进入知识库
                </Button>
                <div className="flex items-center gap-1">
                  <KnowledgeBaseDialog kb={kb} />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-text-muted hover:text-red-600"
                    onClick={() => setDeletingKb(kb)}
                    aria-label={`删除知识库 ${kb.name}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={deletingKb !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingKb(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除知识库</DialogTitle>
            <DialogDescription>
              确定删除知识库「{deletingKb?.name}」吗？其下所有文档与切片将一并删除，此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingKb(null)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
