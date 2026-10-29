export interface RerankOption {
  value: string;
  label: string;
  disabled?: boolean; // 可选：用于灰度或即将上线的模型
}

export const RERANK_MODEL_OPTIONS: RerankOption[] = [
  { value: "0", label: "暂不启用" },
  { value: "qwen3-rerank", label: "qwen3-rerank" },
]
