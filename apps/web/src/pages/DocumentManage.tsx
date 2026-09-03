import { useEffect } from 'react'
import { FileText, Search, Trash2, Upload } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { DocumentStatus } from '@my-rag-agent/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'
import { api } from '@/service'
import { useDocumentStore } from '@/store/document'
import { useKnowledgeBaseStore } from '@/store/knowledgeBase'

const statusMap: Record<
  DocumentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: '待处理',
    className: 'bg-slate-50 text-slate-600 border-slate-200',
  },
  processing: {
    label: '处理中',
    className: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  completed: {
    label: '已完成',
    className: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  failed: {
    label: '失败',
    className: 'bg-red-50 text-red-600 border-red-200',
  },
}

export default function DocumentManagePage() {
  const navigate = useNavigate()
  const documents = useDocumentStore((state) => state.documents)
  const searchQuery = useDocumentStore((state) => state.searchQuery)
  const setSearchQuery = useDocumentStore((state) => state.setSearchQuery)
  const load = useDocumentStore((state) => state.load)
  const remove = useDocumentStore((state) => state.remove)
  const selectedKbId = useKnowledgeBaseStore((state) => state.selectedKbId)

  useEffect(() => {
    void load(selectedKbId || undefined).catch(() => undefined)
  }, [selectedKbId, load])

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = async (id: string, name: string) => {
    try {
      await remove(id)
      toast.success(`文档「${name}」已删除`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  const handleProcess = async (id: string) => {
    try {
      await api.chunk.process(id)
      toast.success('切片处理完成')
      await load(selectedKbId || undefined)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '处理失败')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-main">文档管理</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            共 {documents.length} 个文档
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              className="w-64 pl-9"
              placeholder="搜索文档名称"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <Button onClick={() => navigate('/upload')}>
            <Upload />
            上传文档
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-subtle bg-panel">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="whitespace-nowrap bg-muted px-4">文档名称 / ID</TableHead>
              <TableHead className="whitespace-nowrap bg-muted">文档状态</TableHead>
              <TableHead className="whitespace-nowrap bg-muted">处理策略</TableHead>
              <TableHead className="whitespace-nowrap bg-muted">切片数</TableHead>
              <TableHead className="whitespace-nowrap bg-muted">导入方式</TableHead>
              <TableHead className="whitespace-nowrap bg-muted">更新时间</TableHead>
              <TableHead className="sticky right-0 bg-muted text-right shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-sm text-text-muted"
                >
                  {searchQuery ? '未找到匹配的文档' : '暂无文档，点击右上角上传文档'}
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => {
                const status = statusMap[doc.status]
                return (
                  <TableRow key={doc.id}>
                    <TableCell className="whitespace-nowrap px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-600">
                          <FileText className="size-4" />
                        </div>
                        <div>
                          <div className="font-medium text-text-main">
                            {doc.name}
                          </div>
                          <div className="max-w-72 truncate font-mono text-xs text-text-muted">
                            {doc.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {doc.strategy}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {doc.chunkCount}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {doc.importMethod}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(doc.updatedAt)}
                    </TableCell>
                    <TableCell className="sticky right-0 bg-panel text-right shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-end gap-1">
                        {(doc.status === 'pending' || doc.status === 'failed') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleProcess(doc.id)}
                          >
                            处理
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/chunks?documentId=${doc.id}`}>切片详情</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-text-muted hover:text-red-600"
                          onClick={() => handleDelete(doc.id, doc.name)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
