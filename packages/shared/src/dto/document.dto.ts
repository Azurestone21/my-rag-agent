import type { CommonPageDto } from "./commonPage.dto.js";

export interface DocumentGetPageDto extends CommonPageDto {
  knowledgeBaseId: string;
  name?: string;
}
