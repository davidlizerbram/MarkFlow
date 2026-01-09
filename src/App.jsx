import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Matters } from '@/pages/Matters'
import { MatterDetail } from '@/pages/MatterDetail'
import { Deadlines } from '@/pages/Deadlines'
import { Clients } from '@/pages/Clients'
import { Reports } from '@/pages/Reports'
import { ConflictWatch } from '@/pages/ConflictWatch'
import { TTABPage } from '@/pages/TTABPage'
import { Settings } from '@/pages/Settings'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/matters" element={<Matters />} />
              <Route path="/matters/:id" element={<MatterDetail />} />
              <Route path="/deadlines" element={<Deadlines />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/conflicts" element={<ConflictWatch />} />
              <Route path="/ttab" element={<TTABPage />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
