export type DocumentStatus =
  "pending" | "processing" | "completed" | "failed" | "canceled";

export const DocumentStatusMap: Record<DocumentStatus, number> = {
  pending: 1,
  processing: 2,
  completed: 3,
  failed: 4,
  canceled: 5,
} as const;

export const DocumentStatusTextMap: Record<number, string> = {
  1: "正在上传",
  2: "正在处理",
  3: "已完成",
  4: "上传失败",
  5: "取消上传",
} as const;

export type ChunkProcessConfig =
  | {
      fileType: "text";
      splitMode: "auto";
    }
  | {
      fileType: "text";
      splitMode: "custom";
      separator: string;
      chunkSize: number;
      chunkOverlap: number;
    }
  | {
      fileType: "table";
      headerRow: number;
      dataRow: number;
    };

export interface DocumentDto {
  id: string;
  knowledgeBaseId: string;
  name: string;
  status: number;
  strategy: number;
  chunkCount: number;
  importMethod: number;
  updatedAt: string;
}
