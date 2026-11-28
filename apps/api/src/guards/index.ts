import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './jwt-auth.guard.js';
import { WorkspaceGuard } from './workspace.guard.js';

export const GUARDS = [
  { provide: APP_GUARD, useClass: AuthGuard },
  { provide: APP_GUARD, useClass: WorkspaceGuard },
]