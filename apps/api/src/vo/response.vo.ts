export class ResponseVo<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}
