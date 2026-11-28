declare global {
  namespace Express {
    interface Request {
      user?: {
        role?: Role;
      };
      workspaceId?: string;
    }
  }
}
export {};
