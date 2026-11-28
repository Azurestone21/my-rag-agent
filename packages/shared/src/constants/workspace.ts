export const WORKSPACE_TYPE = {
  PERSONAL: 1,
  TEAM: 2,
} as const;

export type WorkspaceType =
  (typeof WORKSPACE_TYPE)[keyof typeof WORKSPACE_TYPE];

export const WORKSPACE_ROLE = {
  OWNER: 1,
  ADMIN: 2,
  MEMBER: 3,
} as const;

export type WorkspaceRole =
  (typeof WORKSPACE_ROLE)[keyof typeof WORKSPACE_ROLE];
