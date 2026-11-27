export interface PageVo<T> {
  list: T[]
  total: number
  havePrev: boolean
  haveNext: boolean
  pageNum: number
  pageSize: number
}