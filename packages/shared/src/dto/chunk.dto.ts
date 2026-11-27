import type { CommonPageDto } from "./commonPage.dto.js";

export interface ChunkGetPageDto extends CommonPageDto {
  documentId?: string;
  knowledgeBaseId?: string;
  keyword?: string;
}
