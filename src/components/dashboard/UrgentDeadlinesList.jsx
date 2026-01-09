import { Link } from 'react-router-dom'
import { Clock, AlertTriangle, ExternalLink, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeadlineHeatmap } from './DeadlineHeatmap'
import { cn } from '@/lib/utils'

const deadlineTypeLabels = {
  office_action: 'Office Action Response',
  statement_of_use: 'Statement of Use',
  section_8: 'Section 8 Declaration',
  section_8_15: 'Section 8 & 15',
  section_9: 'Section 9 Renewal',
  opposition: 'Opposition Period',
  ttab_deadline: 'TTAB Deadline',
}

export function UrgentDeadlinesList({ deadlines, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-red-500" />
            Urgent Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const urgentDeadlines = deadlines?.filter(d => d.status === 'open') || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-red-500" />
          Urgent Deadlines
          {urgentDeadlines.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {urgentDeadlines.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {urgentDeadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No urgent deadlines in the next 30 days
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {urgentDeadlines.map((deadline) => {
              const isMadrid = deadline.matter?.filing_basis === '66(a)'

              return (
                <div
                  key={deadline.id}
                  className={cn(
                    'flex items-start justify-between rounded-lg border p-4',
                    isMadrid && 'border-purple-300 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-900/10'
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/matters/${deadline.matter_id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {deadline.matter?.mark_text}
                      </Link>
                      {isMadrid && (
                        <Badge variant="outline" className="border-purple-500 text-purple-600">
                          <Globe className="mr-1 h-3 w-3" />
                          Madrid
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {deadlineTypeLabels[deadline.deadline_type] || deadline.deadline_type}
                    </p>
                    {deadline.notes && (
                      <p className="text-xs text-muted-foreground">
                        {deadline.notes}
                      </p>
                    )}
                    {isMadrid && (
                      <div className="flex items-center gap-1 text-xs text-purple-600">
                        <AlertTriangle className="h-3 w-3" />
                        No extension available
                      </div>
                    )}
                    {deadline.is_extended && !isMadrid && (
                      <Badge variant="secondary" className="text-xs">
                        Extension Filed
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <DeadlineHeatmap
                      dueDate={deadline.due_date}
                      status={deadline.status}
                    />
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`https://tsdr.uspto.gov/#caseNumber=${deadline.matter?.serial_num}&caseType=SERIAL_NO&searchType=statusSearch`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        TSDR
                      </a>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
