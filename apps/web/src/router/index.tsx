import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import KnowledgeBasePage from '@/pages/KnowledgeBase'
import DocumentManagePage from '@/pages/DocumentManage'
import ChunkManagePage from '@/pages/ChunkManage'
import KnowledgeSearchPage from '@/pages/KnowledgeSearch'
import KnowledgeQAPage from '@/pages/KnowledgeQA'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/knowledge-base" replace /> },
      { path: 'knowledge-base', element: <KnowledgeBasePage /> },
      { path: 'documents', element: <DocumentManagePage /> },
      { path: 'chunks', element: <ChunkManagePage /> },
      { path: 'search', element: <KnowledgeSearchPage /> },
      { path: 'qa', element: <KnowledgeQAPage /> },
    ],
  },
])
