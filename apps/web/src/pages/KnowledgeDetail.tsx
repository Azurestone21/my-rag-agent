import {
  ChevronLeft,
  FileText,
  Layers,
  MessageSquare,
  Search,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import DocumentManage from './DocumentManage'
import ChunkManage from './ChunkManage'
import KnowledgeSearch from './KnowledgeSearch'
import KnowledgeQA from './KnowledgeQA'
import { useEffect, useState } from 'react'
import { knowledgeBaseApi } from '@/service/knowledge-base'
import type { KnowledgeBaseVo } from '@my-rag-agent/shared'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKnowledgeBaseStore } from '@/store/knowledgeBase'

export default function KnowledgeDetail() {
  const knowledgeBaseNavItems = [
    {
      to: 'documents',
      label: '文档管理',
      icon: FileText,
      element: <DocumentManage />,
    },
    {
      to: 'chunks',
      label: '切片管理',
      icon: Layers,
      element: <ChunkManage />,
    },
    {
      to: '/search',
      label: '知识检索',
      icon: Search,
      element: <KnowledgeSearch />,
    },
    {
      to: 'qa',
      label: '知识问答',
      icon: MessageSquare,
      element: <KnowledgeQA />,
    },
  ]
  const navigate = useNavigate()
  const selectKb = useKnowledgeBaseStore((state) => state.selectKb)

  const { id } = useParams()
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseVo>()
  const [activeTab, setActiveTab] = useState('documents')

  const getKnowledgeBaseDetail = async (id: string) => {
    const kb = await knowledgeBaseApi.getById(id)
    return kb
  }
  // 获取当前知识库信息
  useEffect(() => {
    if (!id) return
    selectKb(id)
    let ignore = false
    getKnowledgeBaseDetail(id).then((kb) => {
      if (!ignore) {
        setKnowledgeBase(kb)
      }
    })

    return () => {
      ignore = true
    }
  }, [id])

  return (
    <>
      {/* 返回按钮 + 标题栏 */}
      <header className="flex justify-between items-center overflow-hidden shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <button className="cursor-pointer" onClick={() => navigate(-1)}>
            <ChevronLeft className="size-5" />
          </button>
          <h2 className="text-xl font-semibold text-text-main">
            {knowledgeBase?.name || ''}
          </h2>
        </div>
      </header>
      {/* 内容区域 */}
      <div className="flex min-h-0 gap-4 h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            {knowledgeBaseNavItems.map((item) => (
              <TabsTrigger key={item.to} value={item.to}>
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {knowledgeBaseNavItems.map((item) => (
            <TabsContent key={item.to} value={item.to} className="h-0 flex-1">
              {item.element}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  )
}
