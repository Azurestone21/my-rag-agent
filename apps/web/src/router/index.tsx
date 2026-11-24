import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import AuthPage from '@/pages/Auth'
import KnowledgeBasePage from '@/pages/KnowledgeBase'
import DocumentManagePage from '@/pages/DocumentManage'
import ChunkManagePage from '@/pages/ChunkManage'
import KnowledgeSearchPage from '@/pages/KnowledgeSearch'
import KnowledgeQAPage from '@/pages/KnowledgeQA'
import UploadWizardPage from '@/pages/UploadWizard'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import KnowledgeDetail from '@/pages/KnowledgeDetail'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/knowledge-base" replace /> },
      { path: '/knowledge-base', element: <KnowledgeBasePage /> },
      { path: 'knowledge-detail/:id', element: <KnowledgeDetail /> },
      { path: 'documents', element: <DocumentManagePage /> },
      { path: 'upload', element: <UploadWizardPage /> },
      { path: 'chunks', element: <ChunkManagePage /> },
      { path: 'search', element: <KnowledgeSearchPage /> },
      { path: 'qa', element: <KnowledgeQAPage /> },
    ],
  },
])
