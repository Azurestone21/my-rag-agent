import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './jwt-auth.guard.js';

export const GUARDS = [
  { provide: APP_GUARD, useClass: AuthGuard },
]