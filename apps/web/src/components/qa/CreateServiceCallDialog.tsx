import { useState } from 'react'
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
import { useChatStore } from '@/store/chat'
import type { ServiceCall } from '@/mock/data'

type CreateServiceCallDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (service: ServiceCall) => void
}

export default function CreateServiceCallDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateServiceCallDialogProps) {
  const [name, setName] = useState('')
  const [topK, setTopK] = useState(10)
  const [purpose, setPurpose] = useState('')
  const createServiceCall = useChatStore((state) => state.createServiceCall)

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('请输入服务名称')
      return
    }
    const service = createServiceCall(name.trim(), Math.max(1, topK))
    toast.success(`问答 API「${name.trim()}」生成成功`)
    setName('')
    setTopK(10)
    setPurpose('')
    onOpenChange(false)
    onCreated(service)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>生成问答 API</DialogTitle>
          <DialogDescription>
            发布当前问答能力，使用 API Key 接入业务系统。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="svc-name">服务名称</Label>
            <Input
              id="svc-name"
              placeholder="例如：学生成绩问答 API"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-topk">topK</Label>
            <Input
              id="svc-topk"
              type="number"
              min={1}
              max={50}
              value={topK}
              onChange={(event) => setTopK(Number(event.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-purpose">服务用途</Label>
            <Input
              id="svc-purpose"
              placeholder="简要描述接入的业务场景"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleCreate}>生成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
