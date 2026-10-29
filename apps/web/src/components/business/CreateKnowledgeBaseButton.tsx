import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { KnowledgeBaseDto } from '@my-rag-agent/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { useKnowledgeBaseStore } from '@/store/knowledgeBase'

type Props = {
  /** 编辑模式：传入要编辑的知识库；创建模式不传 */
  kb?: KnowledgeBaseDto
  /** 自定义触发按钮，不传则使用默认按钮（创建模式显示"创建知识库"，编辑模式显示铅笔图标） */
  trigger?: React.ReactNode
}

export default function KnowledgeBaseDialog({ kb, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const createKb = useKnowledgeBaseStore((state) => state.createKb)
  const updateKb = useKnowledgeBaseStore((state) => state.updateKb)

  const isEdit = Boolean(kb)

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('请输入知识库名称')
      return
    }
    try {
      if (isEdit) {
        await updateKb(kb!.id, name.trim(), description.trim())
        toast.success('更新成功')
      } else {
        await createKb(name.trim(), description.trim())
        toast.success(`知识库「${name.trim()}」创建成功`)
      }
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (isEdit ? '更新失败' : '创建失败'))
    }
  }

  const defaultTrigger = isEdit ? (
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-text-muted hover:text-primary-600"
      aria-label={`编辑知识库 ${kb?.name}`}
    >
      <Pencil />
    </Button>
  ) : (
    <Button>
      <Plus />
      创建知识库
    </Button>
  )

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger ?? defaultTrigger}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? '编辑知识库' : '创建知识库'}</DialogTitle>
            <DialogDescription>
              {isEdit ? '修改知识库名称和描述' : '按业务场景组织表格知识，沉淀可检索资料。'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kb-name">知识库名称</Label>
              <InputGroup>
                <InputGroupInput
                  id="kb-name"
                  maxLength={20}
                  placeholder="例如：销售业绩知识库"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <InputGroupAddon align="inline-end" className="text-xs">
                  {name.length}/20
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kb-description">描述</Label>
              <InputGroup>
                <InputGroupInput
                  id="kb-description"
                  maxLength={100}
                  placeholder="简要描述知识库的用途"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
                <InputGroupAddon align="inline-end" className="text-xs">
                  {description.length}/100
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>{isEdit ? '保存' : '创建'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
