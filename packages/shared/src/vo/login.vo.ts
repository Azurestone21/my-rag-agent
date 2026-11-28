export interface LoginVo {
  userId: number;
  token: string;
  workspaces: {
    id: string;
    name: string;
    type: number;
    role: number;
  }[];
}
