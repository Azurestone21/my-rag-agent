import { useRef, useState, type ChangeEvent } from 'react'
import { FileText, Search, Trash2, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useDocumentStore } from '@/store/document'
import type { DocumentStatus } from '@/mock/data'

const statusMap: Record<
  DocumentStatus,
  { label: string; className: string }
> = {
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

function UploadDocumentDialog() {
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadDocument = useDocumentStore((state) => state.uploadDocument)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setFileName(file.name)
  }

  const handleUpload = () => {
    if (!fileName) {
      toast.error('请先选择文件')
      return
    }
    uploadDocument(fileName)
    toast.success(`文档「${fileName}」上传成功，正在处理`)
    setFileName('')
    setOpen(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Upload />
        上传文档
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传文档</DialogTitle>
            <DialogDescription>
              CSV/XLSX 转 CSV 后进入 Loader 与 Splitter，支持 .csv / .xlsx / .xls
              文件。
            </DialogDescription>
          </DialogHeader>
          <label
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input bg-muted/30 px-4 py-8 text-center transition-colors hover:border-primary-300 hover:bg-primary-50/40',
            )}
          >
            <FileText className="size-8 text-text-muted" />
            <span className="text-sm font-medium text-text-main">
              {fileName || '点击选择文件'}
            </span>
            <span className="text-xs text-text-muted">
              支持 CSV、XLSX、XLS 格式
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpload} disabled={!fileName}>
              确认上传
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function DocumentManagePage() {
  const documents = useDocumentStore((state) => state.documents)
  const searchQuery = useDocumentStore((state) => state.searchQuery)
  const setSearchQuery = useDocumentStore((state) => state.setSearchQuery)
  const deleteDocument = useDocumentStore((state) => state.deleteDocument)

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = (id: string, name: string) => {
    deleteDocument(id)
    toast.success(`文档「${name}」已删除`)
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
          <UploadDocumentDialog />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-subtle bg-panel">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">文档名称 / ID</TableHead>
              <TableHead>文档状态</TableHead>
              <TableHead>处理策略</TableHead>
              <TableHead>切片数</TableHead>
              <TableHead>导入方式</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
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
                    <TableCell className="px-4">
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
                    <TableCell>
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {doc.strategy}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {doc.chunkCount}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {doc.importMethod}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {doc.updatedAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/chunks">切片详情</Link>
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
