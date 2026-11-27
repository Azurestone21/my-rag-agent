import * as React from 'react'
import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// 1. 定义列配置（极简的泛型，完全不用管第三方库的类型）
export interface Column<T> {
  /** 数据字段名 */
  key?: keyof T | string
  /** 表头显示内容 */
  title: React.ReactNode
  /** 自定义单元格渲染（类似 Antd 的 render） */
  render?: (record: T, index: number) => React.ReactNode
  /** 单元格对齐方式 */
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  pageSize?: number
  havePrev?: boolean
  haveNext?: boolean
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  pageSize = 10,
  havePrev = false,
  haveNext = true,
}: DataTableProps<T>) {
  // 2. 简单的分页状态
  const [currentPage, setCurrentPage] = useState(1)

  // 3. 计算当前页的数据（纯数组截取）
  const currentData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return data.slice(firstPageIndex, lastPageIndex)
  }, [data, currentPage, pageSize])

  const totalPages = Math.ceil(data.length / pageSize) || 1

  // 当数据变化导致总页数变小时，自动回到第一页
  // React.useEffect(() => {
  //   if (currentPage > totalPages) setCurrentPage(1)
  // }, [totalPages, currentPage])

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead
                  key={(col.key as string) || index}
                  className={cn(
                    'whitespace-nowrap bg-muted px-4',
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                        ? 'text-center'
                        : '',
                  )}
                >
                  {col.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading 骨架屏
              Array.from({ length: pageSize }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-[80%]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : currentData.length > 0 ? (
              // 渲染真实数据
              currentData.map((record, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <TableCell
                      key={(col.key as string) || colIndex}
                      className={
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                            ? 'text-center'
                            : ''
                      }
                    >
                      {/* 如果有 render 函数就用 render，否则直接用 key 读数据 */}
                      {col.render
                        ? col.render(record, rowIndex)
                        : col.key
                          ? (record[col.key as keyof T] as React.ReactNode)
                          : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // 空状态
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页控制区 */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          共 {data.length} 条数据
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading || !havePrev}
          >
            上一页
          </Button>
          <div className="text-sm font-medium">
            {currentPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading || !haveNext}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  )
}
