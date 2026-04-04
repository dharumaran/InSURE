import { AdminLayout } from '@/layout/AdminLayout'
import { AIAnalystPage } from '@/pages/AIAnalystPage'
import { CARPage } from '@/pages/CARPage'
import { OverviewPage } from '@/pages/OverviewPage'
import { TriggerLogPage } from '@/pages/TriggerLogPage'
import { WorkersPage } from '@/pages/WorkersPage'
import { Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="triggers" element={<TriggerLogPage />} />
        <Route path="workers" element={<WorkersPage />} />
        <Route path="car" element={<CARPage />} />
        <Route path="ai" element={<AIAnalystPage />} />
      </Route>
    </Routes>
  )
}
