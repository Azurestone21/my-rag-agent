// components/confirm-delete-dialog.tsx
'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'

interface ConfirmDeleteProps {
  /** 弹窗标题 */
  title: string
  /** 弹窗描述 */
  description: string
  /** 弹窗取消按钮文案 */
  cancelLabel?: string
  /** 弹窗确认按钮文案 */
  confirmLabel?: string
  /** 点击确认后执行的删除逻辑 */
  onConfirm: () => void
  /** 触发弹窗的按钮文案 */
  triggerLabel: ReactNode | string
}

export function ConfirmDelete({
  title,
  description,
  cancelLabel = '取消',
  confirmLabel = '确认',
  onConfirm,
  triggerLabel,
}: ConfirmDeleteProps) {
  return (
    <AlertDialog>
      {/* asChild 确保 Button 不会嵌套在默认按钮内 */}
      <AlertDialogTrigger asChild>
        {typeof triggerLabel === 'string' ? (
          <Button variant="ghost">{triggerLabel}</Button>
        ) : (
          triggerLabel
        )}  
      </AlertDialogTrigger>
      <AlertDialogContent className="top-[10%] translate-y-0">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          {/* Action 按钮使用 destructive 样式，视觉上突出危险性 */}
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
