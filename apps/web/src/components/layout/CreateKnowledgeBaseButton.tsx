import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import { useKnowledgeBaseStore } from '@/store/knowledgeBase'

export default function CreateKnowledgeBaseButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const createKb = useKnowledgeBaseStore((state) => state.createKb)

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('请输入知识库名称')
      return
    }
    createKb(name.trim(), description.trim())
    toast.success(`知识库「${name.trim()}」创建成功`)
    setName('')
    setDescription('')
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        创建知识库
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建知识库</DialogTitle>
            <DialogDescription>
              按业务场景组织表格知识，沉淀可检索资料。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kb-name">知识库名称</Label>
              <Input
                id="kb-name"
                placeholder="例如：销售业绩知识库"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kb-description">描述</Label>
              <Input
                id="kb-description"
                placeholder="简要描述知识库的用途"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
