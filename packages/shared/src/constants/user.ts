export const Roles = {
  Admin: 1,
  User: 0,
} as const;

export type Role = typeof Roles[keyof typeof Roles];