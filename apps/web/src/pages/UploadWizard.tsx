import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKnowledgeBaseStore } from "@/store/knowledgeBase";
import { api } from "@/service";
import type { DocumentDto, ChunkProcessConfig } from "@my-rag-agent/shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Table2,
  Upload,
  ChevronRight,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Label } from "@/components/ui/label";

type FileType = "text" | "table";

interface WizardState {
  step: 1 | 2 | 3;
  fileType: FileType;
  file: File | null;
  textSplitMode: "auto" | "custom";
  separator: string;
  customSeparator: string;
  chunkSize: number;
  chunkOverlap: number;
  headerRow: number;
  dataRow: number;
}

const defaultState: WizardState = {
  step: 1,
  fileType: "text",
  file: null,
  textSplitMode: "auto",
  separator: "newline",
  customSeparator: "",
  chunkSize: 500,
  chunkOverlap: 10,
  headerRow: 0,
  dataRow: 1,
};

const SEPARATOR_OPTIONS = [
  { value: "newline", label: "换行" },
  { value: "paragraph", label: "空行（双换行）" },
  { value: "chinese_period", label: "中文句号" },
  { value: "chinese_exclaim", label: "中文叹号" },
  { value: "english_period", label: "英文句号" },
  { value: "english_exclaim", label: "英文叹号" },
  { value: "chinese_question", label: "中文问号" },
  { value: "english_question", label: "英文问号" },
  { value: "custom", label: "自定义（输入内容）" },
];

// const TEXT_EXTS = new Set([".txt", ".md"]);
const TABLE_EXTS = new Set([".xlsx", ".xls", ".csv"]);

function inferFileType(file: File): FileType {
  const name = file.name.toLowerCase();
  const ext = name.substring(name.lastIndexOf("."));
  if (TABLE_EXTS.has(ext)) return "table";
  return "text";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function buildConfig(state: WizardState): ChunkProcessConfig {
  if (state.fileType === "table") {
    return {
      fileType: "table",
      headerRow: state.headerRow,
      // headerRow=0（自动检测）时 dataRow 无意义，传 0 表示从表头下一行开始
      dataRow:
        state.headerRow === 0
          ? 0
          : Math.max(state.headerRow + 1, state.dataRow),
    };
  }
  if (state.textSplitMode === "auto") {
    return { fileType: "text", splitMode: "auto" };
  }
  return {
    fileType: "text",
    splitMode: "custom",
    separator:
      state.separator === "custom" ? state.customSeparator : state.separator,
    chunkSize: state.chunkSize,
    chunkOverlap: Math.round((state.chunkSize * state.chunkOverlap) / 100),
  };
}

interface StepIndicatorProps {
  current: number;
  steps: string[];
}

function StepIndicator({ current, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={label} className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                done && "bg-primary text-white",
                active && "bg-primary text-white",
                !done && !active && "bg-border-subtle text-text-muted",
              )}
            >
              {done ? <CheckCircle2 className="size-4" /> : num}
            </div>
            <span
              className={cn(
                "text-sm",
                active ? "font-medium text-text-main" : "text-text-muted",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-px w-8",
                  done ? "bg-primary" : "bg-border-subtle",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface StepProps {
  state: WizardState;
  update: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function Step1({ state, update, fileInputRef }: StepProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const inferred = inferFileType(f);
    update("file", f);
    update("fileType", inferred);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    const inferred = inferFileType(f);
    update("file", f);
    update("fileType", inferred);
  };

  const handleRemove = () => {
    update("file", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <Label>选择文件类型</Label>
        <div className="flex gap-3">
          {[
            { value: "text" as FileType, icon: FileText, title: "文本格式" },
            { value: "table" as FileType, icon: Table2, title: "表格格式" },
          ].map((opt) => {
            const Icon = opt.icon;
            const active = state.fileType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  if (state.file && state.fileType !== opt.value) {
                    update("file", null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }
                  update("fileType", opt.value);
                }}
                className={cn(
                  "flex w-[140px] h-[60px] items-center justify-center gap-2 rounded-lg border-2 transition-all",
                  active
                    ? "border-primary bg-primary-50/60"
                    : "border-border-subtle bg-panel hover:border-primary-300/60",
                )}
              >
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md",
                    opt.value === "text"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-emerald-50 text-emerald-600",
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <span className="text-sm font-medium text-text-main">
                  {opt.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <Label>上传文件</Label>
        {!state.file ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border-subtle bg-panel px-6 py-12 transition-colors hover:border-primary-400/60 hover:bg-primary-50/30"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary-50 text-primary">
              <Upload className="size-6" />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-text-main">
                点击或拖拽文件到此处上传
              </div>
              <div className="mt-1 text-xs text-text-muted">
                {state.fileType === "text"
                  ? "支持 .txt / .md"
                  : "支持 .xlsx / .xls / .csv"}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={
                state.fileType === "text"
                  ? ".txt,.md"
                  : ".xlsx,.xls,.csv"
              }
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-panel px-4 py-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                state.fileType === "text"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-emerald-50 text-emerald-600",
              )}
            >
              {state.fileType === "text" ? (
                <FileText className="size-5" />
              ) : (
                <Table2 className="size-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-text-main">
                {state.file.name}
              </div>
              <div className="text-xs text-text-muted">
                {formatSize(state.file.size)}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleRemove}
              className="text-text-muted hover:text-red-500"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step2({ state, update }: StepProps) {
  if (state.fileType === "text") {
    return (
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <Label>分段策略</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                mode: "auto" as const,
                title: "自动分段与清洗",
                desc: "自动分段与预处理规则",
              },
              {
                mode: "custom" as const,
                title: "自定义",
                desc: "自定义分段规则、分段长度及预处理规则",
              },
            ].map((opt) => {
              const active = state.textSplitMode === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => update("textSplitMode", opt.mode)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-all",
                    active
                      ? "border-primary bg-primary-50/60"
                      : "border-border-subtle bg-panel hover:border-primary-300/60",
                  )}
                >
                  <div className="text-sm font-medium text-text-main">
                    {opt.title}
                  </div>
                  <div className="mt-1 text-xs text-text-muted">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {state.textSplitMode === "custom" && (
          <div className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-panel p-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-main">
                分段标识符 <span className="text-red-500">*</span>
              </label>
              <Select
                value={state.separator}
                onValueChange={(v) => update("separator", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEPARATOR_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {state.separator === "custom" && (
              <div className="space-y-4">
                <Label>自定义分段标识</Label>
                <Input
                  value={state.customSeparator}
                  onChange={(e) => update("customSeparator", e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-main">
                分段最大长度 <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min={100}
                max={5000}
                value={state.chunkSize}
                onChange={(e) => update("chunkSize", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-main">
                分段重叠度% <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min={0}
                max={50}
                value={state.chunkOverlap}
                onChange={(e) => update("chunkOverlap", Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-main">
            表头
          </label>
          <Select
            value={String(state.headerRow)}
            onValueChange={(v) => {
              const val = Number(v);
              update("headerRow", val);
              if (state.dataRow < val + 1) update("dataRow", val + 1);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">自动检测（推荐）</SelectItem>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  第{n}行
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {state.headerRow > 0 ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-main">
              数据起始行
            </label>
            <Select
              value={String(state.dataRow)}
              onValueChange={(v) => update("dataRow", Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: 20 - state.headerRow },
                  (_, i) => state.headerRow + 1 + i,
                ).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    第{n}行
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex flex-col justify-end pb-1">
            <p className="text-xs leading-relaxed text-text-muted">
              自动识别真正的表头行，并从其下一行开始解析数据
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface Step3Props {
  state: WizardState;
  result: DocumentDto | null;
  error: string | null;
}

function Step3({ state, result, error }: Step3Props) {
  return (
    <div className="flex flex-col items-center gap-6">
      {state.file && (
        <div className="flex w-full items-center gap-3 rounded-lg border border-border-subtle bg-panel px-4 py-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              state.fileType === "text"
                ? "bg-blue-50 text-blue-600"
                : "bg-emerald-50 text-emerald-600",
            )}
          >
            {state.fileType === "text" ? (
              <FileText className="size-5" />
            ) : (
              <Table2 className="size-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-text-main">
              {state.file.name}
            </div>
            <div className="text-xs text-text-muted">
              {formatSize(state.file.size)}
            </div>
          </div>
          <div className="w-fit">
            {error ? (
              <div className="text-sm text-red-500 text-right">上传失败</div>
            ) : result?.status === "completed" ? (
              <>
                <div className="text-sm text-text-main text-right">
                  处理完成
                </div>
                <div className="mt-1 text-sm text-text-muted">
                  共生成 {result.chunkCount ?? 0} 个切片
                </div>
              </>
            ) : (
              <div className="text-sm text-text-main text-right">
                正在处理...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UploadWizardPage() {
  const navigate = useNavigate();
  const selectedKbId = useKnowledgeBaseStore((s) => s.selectedKbId);
  const refreshKbList = useKnowledgeBaseStore((s) => s.load);
  const [state, setState] = useState<WizardState>(defaultState);
  const [result, setResult] = useState<DocumentDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(
    <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
      setState((s) => ({ ...s, [key]: value }));
    },
    [],
  );

  const canNext = (() => {
    if (state.step === 1) return !!state.file;
    if (state.step === 2) {
      if (state.fileType === "text" && state.textSplitMode === "custom") {
        const separatorOk =
          state.separator !== "custom" ||
          state.customSeparator.trim().length > 0;
        return state.chunkSize > 0 && state.chunkOverlap >= 0 && separatorOk;
      }
      return true;
    }
    return false;
  })();

  const handleNext = () => {
    if (state.step === 1) {
      update("step", 2);
    } else if (state.step === 2) {
      update("step", 3);
    }
  };

  const handlePrev = () => {
    if (state.step === 2) update("step", 1);
  };

  useEffect(() => {
    if (state.step !== 3 || !state.file || result || error) return;

    const config = buildConfig(state);
    setError(null);
    setResult(null);

    let cancelled = false;

    (async () => {
      try {
        if (!selectedKbId) throw new Error("未选择知识库");
        const doc = await api.document.upload(
          selectedKbId,
          state.file!,
          config,
        );
        if (cancelled) return;
        setResult(doc);

        const poll = async () => {
          if (cancelled) return;
          try {
            const latest = await api.document.get(doc.id);
            if (cancelled) return;
            setResult(latest);
            if (latest.status !== "completed" && latest.status !== "failed") {
              setTimeout(poll, 2000);
            } else {
              refreshKbList().catch(() => undefined);
            }
          } catch {
            if (!cancelled) setTimeout(poll, 2000);
          }
        };
        setTimeout(poll, 2000);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "上传失败");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.step, state.file, selectedKbId, refreshKbList]);

  const handleFinish = () => {
    navigate("/documents");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
        <div className="flex items-center gap-8">
          <StepIndicator
            current={state.step}
            steps={["上传文件", "处理配置", "数据处理"]}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <span className="ml-1">取消</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {state.step === 1 && (
          <Step1 state={state} update={update} fileInputRef={fileInputRef} />
        )}
        {state.step === 2 && (
          <Step2 state={state} update={update} fileInputRef={fileInputRef} />
        )}
        {state.step === 3 && (
          <Step3 state={state} result={result} error={error} />
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border-subtle px-6 py-4">
        {state.step === 2 && (
          <Button variant="outline" onClick={handlePrev}>
            <span className="ml-1">上一步</span>
          </Button>
        )}
        {state.step === 1 && (
          <Button
            onClick={handleNext}
            disabled={!canNext}
            className="bg-primary hover:bg-primary/90"
          >
            下一步
          </Button>
        )}
        {state.step === 2 && (
          <Button
            onClick={handleNext}
            disabled={!canNext}
            className="bg-primary hover:bg-primary/90"
          >
            下一步
            <ChevronRight className="size-4" />
          </Button>
        )}
        {state.step === 3 &&
          (result?.status === "completed" || result?.status === "failed") && (
            <Button
              onClick={handleFinish}
              className="bg-primary hover:bg-primary/90"
            >
              完成
            </Button>
          )}
      </div>
    </div>
  );
}
