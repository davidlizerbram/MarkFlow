import { KPICards } from '@/components/dashboard/KPICards'
import { MattersTable } from '@/components/dashboard/MattersTable'
import { UrgentDeadlinesList } from '@/components/dashboard/UrgentDeadlinesList'
import { useMatters, useKPISummary, useUrgentDeadlines } from '@/hooks/useMatters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Dashboard() {
  const { data: matters, isLoading: mattersLoading } = useMatters()
  const { data: kpiData, isLoading: kpiLoading } = useKPISummary()
  const { data: urgentDeadlines, isLoading: deadlinesLoading } = useUrgentDeadlines()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to MarkFlow - Your Trademark Triage Center
        </p>
      </div>

      {/* KPI Cards */}
      <KPICards data={kpiData} isLoading={kpiLoading} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Urgent Deadlines - Sidebar */}
        <div className="lg:col-span-1">
          <UrgentDeadlinesList
            deadlines={urgentDeadlines}
            isLoading={deadlinesLoading}
          />
        </div>

        {/* Matters Table - Main Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="registered">Registered</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <MattersTable matters={matters} isLoading={mattersLoading} />
                </TabsContent>
                <TabsContent value="active" className="mt-4">
                  <MattersTable
                    matters={matters?.filter(
                      (m) => m.status_code >= 400 && m.status_code < 800
                    )}
                    isLoading={mattersLoading}
                  />
                </TabsContent>
                <TabsContent value="registered" className="mt-4">
                  <MattersTable
                    matters={matters?.filter((m) => m.reg_num)}
                    isLoading={mattersLoading}
                  />
                </TabsContent>
                <TabsContent value="pending" className="mt-4">
                  <MattersTable
                    matters={matters?.filter((m) => !m.reg_num && m.status_code < 900)}
                    isLoading={mattersLoading}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
