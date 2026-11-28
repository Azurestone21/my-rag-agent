import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module.js';
import { DocumentModule } from './document/document.module.js';
import { ChunkModule } from './chunk/chunk.module.js';
import { SearchModule } from './search/search.module.js';
import { ChatModule } from './chat/chat.module.js';
import { ServiceCallModule } from './service-call/service-call.module.js';
import { AuthModule } from './auth/auth.module.js';
import { WorkspaceModule } from './workspace/workspace.module.js';

export const modules = [
  AuthModule,
  KnowledgeBaseModule,
  DocumentModule,
  ChunkModule,
  SearchModule,
  ChatModule,
  ServiceCallModule,
  WorkspaceModule,
];
