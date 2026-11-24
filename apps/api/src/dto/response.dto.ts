export class ResponseDto<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}
