import { FileText, Clock, Scale, CheckCircle, FileQuestion } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const kpiConfig = [
  {
    key: 'totalMarks',
    title: 'Total Marks',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    key: 'urgentDeadlines',
    title: 'Urgent Deadlines',
    subtitle: '< 30 days',
    icon: Clock,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    highlight: true,
  },
  {
    key: 'activeTTABProceedings',
    title: 'Active TTAB',
    icon: Scale,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    key: 'registeredMarks',
    title: 'Registered',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    key: 'pendingApplications',
    title: 'Pending',
    icon: FileQuestion,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
]

export function KPICards({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpiConfig.map((kpi) => (
          <Card key={kpi.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={cn('rounded-md p-2', kpi.bgColor)}>
                <kpi.icon className={cn('h-4 w-4', kpi.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {kpiConfig.map((kpi) => (
        <Card
          key={kpi.key}
          className={cn(
            kpi.highlight && data?.[kpi.key] > 0 && 'ring-2 ring-red-500/50'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              {kpi.subtitle && (
                <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
              )}
            </div>
            <div className={cn('rounded-md p-2', kpi.bgColor)}>
              <kpi.icon className={cn('h-4 w-4', kpi.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                kpi.highlight && data?.[kpi.key] > 0 && 'text-red-600'
              )}
            >
              {data?.[kpi.key] ?? 0}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
