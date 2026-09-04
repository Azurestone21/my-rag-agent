import { Settings2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import type { SearchParamsDto } from '@my-rag-agent/shared'
import { RERANK_MODEL_OPTIONS } from '@/constants/rerank.constants'

type SearchParamsPanelProps = {
  title?: string
  params: SearchParamsDto
  onChange: (params: Partial<SearchParamsDto>) => void
}

export default function SearchParamsPanel({
  title = '检索参数',
  params,
  onChange,
}: SearchParamsPanelProps) {
  return (
    <div className="rounded-lg border border-border-subtle bg-panel p-4">
      <div className="flex items-center gap-2">
        <Settings2 className="size-4 text-primary-600" />
        <h2 className="text-sm font-semibold text-text-main">{title}</h2>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-text-muted">
        调整检索参数，观察知识命中效果
      </p>

      <div className="mt-5 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="result-count">结果返回量</Label>
          <Input
            id="result-count"
            type="number"
            min={1}
            max={50}
            value={params.resultCount}
            onChange={(event) =>
              onChange({
                resultCount: Math.max(1, Number(event.target.value) || 1),
              })
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>最低相似度</Label>
            <span className="text-xs font-medium text-primary-600">
              {params.minSimilarity.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[params.minSimilarity]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(value) => onChange({ minSimilarity: value[0] ?? 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label>重排模型</Label>
          <Select
            value={params.rerankModel || '0'}
            onValueChange={(value) => onChange({ rerankModel: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择重排模型" />
            </SelectTrigger>
            <SelectContent>
              {RERANK_MODEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Dense Weight</Label>
            <span className="text-xs font-medium text-primary-600">
              {params.denseWeight.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[params.denseWeight]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={(value) => onChange({ denseWeight: value[0] ?? 0 })}
          />
        </div>
      </div>
    </div>
  )
}
