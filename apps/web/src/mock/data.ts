export type KnowledgeBase = {
  id: string
  name: string
  description: string
  documentCount: number
  chunkCount: number
  updatedAt: string
}

export type DocumentStatus = 'processing' | 'completed' | 'failed'

export type DocumentItem = {
  id: string
  knowledgeBaseId: string
  name: string
  status: DocumentStatus
  strategy: string
  chunkCount: number
  importMethod: string
  updatedAt: string
}

export type ChunkItem = {
  id: string
  documentId: string
  index: number
  content: string
  charCount: number
  updatedAt: string
}

export type SearchResultItem = {
  chunkId: string
  documentName: string
  content: string
  similarity: number
}

export type SearchParams = {
  resultCount: number
  minSimilarity: number
  rerankModel: string
  denseWeight: number
}

export type ChatSource = {
  chunkId: string
  documentName: string
  content: string
  similarity: number
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: ChatSource[]
  createdAt: string
}

export type ServiceCall = {
  id: string
  name: string
  topK: number
  apiKey: string
  createdAt: string
}

export const knowledgeBases: KnowledgeBase[] = [
  {
    id: 'kb_my-rag-agent',
    name: 'my-rag-agent',
    description: '按业务场景组织表格知识，沉淀可检索资料',
    documentCount: 3,
    chunkCount: 10,
    updatedAt: '2026/07/02 21:44',
  },
  {
    id: 'kb_sales',
    name: '销售业绩库',
    description: '销售订单与业绩数据，用于销售场景的检索与问答',
    documentCount: 0,
    chunkCount: 0,
    updatedAt: '2026/07/03 09:12',
  },
  {
    id: 'kb_hr',
    name: '人事制度库',
    description: '员工手册与人事制度文档',
    documentCount: 0,
    chunkCount: 0,
    updatedAt: '2026/07/05 14:30',
  },
]

export const documents: DocumentItem[] = [
  {
    id: 'doc-75d132b9-c537-421e-9222-8c1aa0ebab7',
    knowledgeBaseId: 'kb_my-rag-agent',
    name: 'llgbk.csv',
    status: 'completed',
    strategy: 'my-rag-agent-init-version',
    chunkCount: 10,
    importMethod: '本地上传',
    updatedAt: '2026/07/02 21:43',
  },
]

export const chunks: ChunkItem[] = [
  {
    id: 'doc-3d3f2a2f-a355-4834-a508-75ae0944b292',
    documentId: 'doc-75d132b9-c537-421e-9222-8c1aa0ebab7',
    index: 0,
    content:
      '日期 sheet1: 2019/9/1 销售人：小王 手机型号：小米9 数量：1 单价：2799 订单金额：2799 订单状态：发货中',
    charCount: 119,
    updatedAt: '2026/07/02 21:44',
  },
  {
    id: 'doc-3d3f2a2f-a355-4834-a508-75ae0944b292',
    documentId: 'doc-75d132b9-c537-421e-9222-8c1aa0ebab7',
    index: 1,
    content:
      '日期 sheet1: 2019/9/20 销售人：小孙 手机型号：Redmi Note 8 Pro 数量：5 单价：1399 订单金额：6995 订单状态：发货中',
    charCount: 82,
    updatedAt: '2026/07/02 21:44',
  },
  {
    id: 'doc-3d3f2a2f-a355-4834-a508-75ae0944b292',
    documentId: 'doc-75d132b9-c537-421e-9222-8c1aa0ebab7',
    index: 2,
    content:
      '日期 sheet1: 2019/9/19 销售人：小赵 手机型号：Redmi K20 数量：5 单价：1999 订单金额：9995 订单状态：交易成功',
    charCount: 88,
    updatedAt: '2026/07/02 21:44',
  },
  {
    id: 'doc-3d3f2a2f-a355-4834-a508-75ae0944b292',
    documentId: 'doc-75d132b9-c537-421e-9222-8c1aa0ebab7',
    index: 3,
    content:
      '日期 sheet1: 2019/9/18 销售人：小王 手机型号：小米9 数量：1 单价：2799 订单金额：2799 订单状态：交易成功',
    charCount: 84,
    updatedAt: '2026/07/02 21:44',
  },
  {
    id: 'doc-3d3f2a2f-a355-4834-a508-75ae0944b292',
    documentId: 'doc-75d132b9-c537-421e-9222-8c1aa0ebab7',
    index: 4,
    content:
      '日期 sheet1: 2019/9/13 销售人：小赵 手机型号：小米9 数量：1 单价：2799 订单金额：2799 订单状态：交易成功',
    charCount: 84,
    updatedAt: '2026/07/02 21:44',
  },
  {
    id: 'doc-3d3f2a2f-a355-4834-a508-75ae0944b292',
    documentId: 'doc-75d132b9-c537-421e-9222-8c1aa0ebab7',
    index: 5,
    content:
      '日期 sheet1: 2019/9/16 销售人：小赵 手机型号：小米9 数量：2 单价：2799 订单金额：5598 订单状态：交易成功',
    charCount: 84,
    updatedAt: '2026/07/02 21:44',
  },
  {
    id: 'doc-3d3f2a2f-a355-4834-a508-75ae0944b292',
    documentId: 'doc-75d132b9-c537-421e-9222-8c1aa0ebab7',
    index: 6,
    content:
      '日期 sheet1: 2019/9/15 销售人：小王 手机型号：Redmi Note 8 Pro 数量：5 单价：1399 订单金额：6995 订单状态：交易成功',
    charCount: 89,
    updatedAt: '2026/07/02 21:44',
  },
  {
    id: 'doc-3d3f2a2f-a355-4834-a508-75ae0944b292',
    documentId: 'doc-75d132b9-c537-421e-9222-8c1aa0ebab7',
    index: 7,
    content:
      '日期 sheet1: 2019/9/12 销售人：小王 手机型号：小米 Mix 2S 数量：2 单价：1799 订单金额：3598 订单状态：交易成功',
    charCount: 88,
    updatedAt: '2026/07/02 21:44',
  },
  {
    id: 'doc-3d3f2a2f-a355-4834-a508-75ae0944b292',
    documentId: 'doc-75d132b9-c537-421e-9222-8c1aa0ebab7',
    index: 8,
    content:
      '日期 sheet1: 2019/9/10 销售人：小孙 手机型号：Redmi K20 Pro 数量：3 单价：2499 订单金额：7497 订单状态：已签收',
    charCount: 86,
    updatedAt: '2026/07/02 21:44',
  },
  {
    id: 'doc-3d3f2a2f-a355-4834-a508-75ae0944b292',
    documentId: 'doc-75d132b9-c537-421e-9222-8c1aa0ebab7',
    index: 9,
    content:
      '日期 sheet1: 2019/9/8 销售人：小赵 手机型号：小米 9 SE 数量：1 单价：1999 订单金额：1999 订单状态：交易成功',
    charCount: 82,
    updatedAt: '2026/07/02 21:44',
  },
]

export const mockSearchResults: SearchResultItem[] = [
  {
    chunkId: 'doc-3d3f2a2f-a355-4834-a508-75ae0944b292.4',
    documentName: 'llgbk.csv',
    content:
      '日期 sheet1: 2019/9/13 销售人：小赵 手机型号：小米9 数量：1 单价：2799 订单金额：2799 订单状态：交易成功',
    similarity: 0.571576,
  },
  {
    chunkId: 'doc-3d3f2a2f-a355-4834-a508-75ae0944b292.5',
    documentName: 'llgbk.csv',
    content:
      '日期 sheet1: 2019/9/16 销售人：小赵 手机型号：小米9 数量：2 单价：2799 订单金额：5598 订单状态：交易成功',
    similarity: 0.572458,
  },
  {
    chunkId: 'doc-3d3f2a2f-a355-4834-a508-75ae0944b292.3',
    documentName: 'llgbk.csv',
    content:
      '日期 sheet1: 2019/9/18 销售人：小王 手机型号：小米9 数量：1 单价：2799 订单金额：2799 订单状态：交易成功',
    similarity: 0.568912,
  },
]

export const chatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'heyi 成绩是多少？',
    createdAt: '2026/07/02 21:45',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content:
      '您未明确关于小王的具体查询需求（例如小王的销售业绩、对应订单情况等具体问题），无法为您提供针对性解答。已检索到的销售人为「小王」的相关资料如下：\n1. 2019年9月18日售小米9 1台，单价2799元，订单状态为交易成功；\n2. 2019年9月15日，Redmi Note 8 Pro 5台，单价1399元，订单状态为交易成功；\n3. 2019年9月12日，售小米 Mix 2S 2台，单价1799元，订单状态为交易成功。\n我可以阅读知识库的资料并使用自然语言回答你的问题。',
    sources: mockSearchResults,
    createdAt: '2026/07/02 21:45',
  },
]

export const serviceCalls: ServiceCall[] = [
  {
    id: 'svc_f37818db-e9e7-43f4-a3bd-6cbecdf0ffb4',
    name: '学生成绩问答 API',
    topK: 10,
    apiKey: 'mk-qtjg10gqCM-QkSfLbg80Bv9ZoBXdGHDI',
    createdAt: '2026/07/02 21:46',
  },
]

export const defaultSearchParams: SearchParams = {
  resultCount: 10,
  minSimilarity: 0,
  rerankModel: '暂不启用',
  denseWeight: 0.5,
}
