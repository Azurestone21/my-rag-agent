import { useEffect } from 'react'
import { FileText, Search, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { DocumentVo } from '@my-rag-agent/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDelete } from '@/components/common/ConfirmDelete'
import { formatDateTime } from '@/lib/format'
import { api } from '@/service'
import { useDocumentStore } from '@/store/document'
import { useKnowledgeBaseStore } from '@/store/knowledgeBase'
import { DataTable, type Column } from '@/components/common/DataTable'
import { DocumentStatusMap } from '@my-rag-agent/shared'

const statusMap: Record<number, { label: string; className: string }> = {
  [DocumentStatusMap.canceled]: {
    label: '已取消',
    className: 'bg-gray-50 text-gray-600 border-gray-200',
  },
  [DocumentStatusMap.pending]: {
    label: '待处理',
    className: 'bg-slate-50 text-slate-600 border-slate-200',
  },
  [DocumentStatusMap.processing]: {
    label: '处理中',
    className: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  [DocumentStatusMap.completed]: {
    label: '已完成',
    className: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  [DocumentStatusMap.failed]: {
    label: '失败',
    className: 'bg-red-50 text-red-600 border-red-200',
  },
}

const strategyMap: Record<number, string> = {
  1: '默认',
  2: '自定义',
}

const importMethodMap: Record<number, string> = {
  1: '本地上传',
}

export default function DocumentManagePage() {
  const navigate = useNavigate()
  const documents = useDocumentStore((state) => state.documents)
  const searchName = useDocumentStore((state) => state.searchName)
  const setSearchName = useDocumentStore((state) => state.setSearchName)
  const load = useDocumentStore((state) => state.load)
  const remove = useDocumentStore((state) => state.remove)
  const selectedKbId = useKnowledgeBaseStore((state) => state.selectedKbId)

  useEffect(() => {
    void load(selectedKbId, searchName).catch(() => undefined)
  }, [selectedKbId, searchName, load])

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

  const columns: Column<DocumentVo>[] = [
    {
      key: 'name',
      title: '文档名称 / ID',
      align: 'left',
      render: (record) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-600">
            <FileText className="size-4" />
          </div>
          <div>
            <div className="font-medium text-text-main">{record.name}</div>
            <div className="max-w-72 truncate font-mono text-xs text-text-muted">
              {record.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: '文档状态',
      align: 'center',
      render: (record) => (
        <Badge
          variant="outline"
          className={statusMap[record?.status]?.className || ''}
        >
          {statusMap[record?.status]?.label}
        </Badge>
      ),
    },
    {
      key: 'importMethod',
      title: '导入方式',
      align: 'center',
      render: (record) => (
        <span>{importMethodMap[record?.importMethod] || '-'}</span>
      ),
    },
    {
      key: 'strategy',
      title: '处理策略',
      align: 'center',
      render: (record) => <span>{strategyMap[record?.strategy] || '-'}</span>,
    },
    {
      key: 'chunkCount',
      title: '切片数',
      align: 'center',
    },
    {
      key: 'updatedAt',
      title: '更新时间',
      align: 'center',
      render: (record) => formatDateTime(record.updatedAt),
    },
    {
      title: '操作',
      align: 'right',
      render: (record) => (
        <div className="flex justify-end gap-2">
          {(record.status === DocumentStatusMap.pending ||
            record.status === DocumentStatusMap.failed) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleProcess(record.id)}
            >
              处理
            </Button>
          )}
          <ConfirmDelete
            title="删除确认"
            description="确定要删除文档吗？"
            triggerLabel={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-red-600 hover:text-red-600"
              >
                删除
              </Button>
            }
            cancelLabel="取消"
            confirmLabel="确认"
            onConfirm={() => {
              handleDelete(record.id, record.name)
            }}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {/* <h1 className="text-xl font-semibold text-text-main">文档管理</h1> */}
          <p className="mt-0.5 text-sm text-text-muted">
            共 {documents.total} 个文档
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              className="w-64 pl-9 bg-white"
              placeholder="搜索文档名称"
              value={searchName}
              onChange={(event) => setSearchName(event.target.value)}
            />
          </div>
          <Button onClick={() => navigate('/upload')}>
            <Upload />
            上传文档
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg">
        <DataTable columns={columns} data={documents.list} havePrev={documents.havePrev} haveNext={documents.haveNext} />
      </div>
    </div>
  )
}
