export const Roles = {
  Admin: 1,
  User: 2,
} as const;

export type Role = typeof Roles[keyof typeof Roles];