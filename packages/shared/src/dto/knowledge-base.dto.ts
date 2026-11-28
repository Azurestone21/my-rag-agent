export interface CreateKnowledgeBaseDto {
  name: string;
  description?: string;
}

export interface UpdateKnowledgeBaseDto extends CreateKnowledgeBaseDto {
  id: string;
}
